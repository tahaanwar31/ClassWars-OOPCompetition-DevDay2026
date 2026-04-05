import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class CompilerService {
  private readonly JDOODLE_API_URL = 'https://api.jdoodle.com/v1/execute';
  private readonly JDOODLE_CLIENT_ID = process.env.JDOODLE_CLIENT_ID || '';
  private readonly JDOODLE_CLIENT_SECRET = process.env.JDOODLE_CLIENT_SECRET || '';

  constructor(private readonly httpService: HttpService) {}

  async compileCode(code: string, level: number): Promise<{ success: boolean; output?: string; error?: string }> {
    console.log(`[Level ${level}] Compiling code...`);
    console.log('Using JDoodle API');

    // Remove the fake include so it compiles cleanly
    const cleanCode = code.replace('#include "Tank.h"', '');

    // --- C++ TEST HARNESS (Level-specific behavioral profiling) ---
    // The harness runs multiple scenarios and outputs a machine-readable PROFILE summary.
    // Each scenario tests a different game state to derive the tank's behavioral profile.
    let cppWrapper = `
#include <iostream>
#include <cmath>
using namespace std;

struct Enemy {
    float y = 50.0;
    float hp = 100.0;
    bool firing = false;
    bool isFiring() { return firing; }
};

class Tank {
public:
    float y = 50.0;
    float hp = 100.0;
    Enemy enemy;
    string moveAction = "idle";
    string fireAction = "none";
    string shieldAction = "none";

    virtual void move() {}
    virtual void attack() {}
    virtual void defend() {}

    void moveUp() { moveAction = "up"; }
    void moveDown() { moveAction = "down"; }
    void fire() { fireAction = "always"; }
    void activateShield() { shieldAction = "smart"; }
};

${cleanCode}

int main() {
    MyTank t;
`;

    if (level === 1) {
      // LEVEL 1: Checkpoint Navigation Profiling
      // Tests movement toward checkpoint positions at Y: 20, 50, 80
      // The tank starts at Y=50 and needs to navigate to all 3 checkpoints in order.
      cppWrapper += `
    // Scenario 1: Tank at Y=80, first checkpoint at Y=20 -> should move UP
    t.y = 80.0; t.moveAction = "idle"; t.move();
    cout << "LEVEL1:S80:" << t.moveAction << endl;

    // Scenario 2: Tank at Y=20, second checkpoint at Y=50 -> should move DOWN
    t.y = 20.0; t.moveAction = "idle"; t.move();
    cout << "LEVEL1:S20:" << t.moveAction << endl;

    // Scenario 3: Tank at Y=50, third checkpoint at Y=80 -> should move DOWN
    t.y = 50.0; t.moveAction = "idle"; t.move();
    cout << "LEVEL1:S50:" << t.moveAction << endl;

    // Scenario 4: Tank at Y=50, first checkpoint at Y=20 -> should move UP
    t.y = 50.0; t.moveAction = "idle"; t.move();
    cout << "LEVEL1:S50B:" << t.moveAction << endl;

    // Scenario 5: Tank at Y=30, adaptive test
    t.y = 30.0; t.moveAction = "idle"; t.move();
    cout << "LEVEL1:S30:" << t.moveAction << endl;

    return 0;
}
`;
    } else if (level === 2) {
      // LEVEL 2: Enemy/Target Tracking + Firing Profiling
      // Tests movement toward targets, firing when aligned, and behavior at distance.
      cppWrapper += `
    // Scenario 1: Target above (enemy.y=20, tank.y=50) -> should move UP
    t.enemy.y = 20.0; t.y = 50.0; t.moveAction = "idle"; t.move();
    cout << "LEVEL2:ABOVE:" << t.moveAction << endl;

    // Scenario 2: Target below (enemy.y=80, tank.y=50) -> should move DOWN
    t.enemy.y = 80.0; t.y = 50.0; t.moveAction = "idle"; t.move();
    cout << "LEVEL2:BELOW:" << t.moveAction << endl;

    // Scenario 3: Aligned with target (enemy.y=50, tank.y=50) -> should fire or stay
    t.enemy.y = 50.0; t.y = 50.0; t.moveAction = "idle"; t.attack();
    cout << "LEVEL2:ALIGNED:" << t.fireAction << endl;

    // Scenario 4: Target far away (enemy.y=10, tank.y=90) -> should move UP
    t.enemy.y = 10.0; t.y = 90.0; t.moveAction = "idle"; t.move();
    cout << "LEVEL2:FAR:" << t.moveAction << endl;

    return 0;
}
`;
    } else if (level === 3) {
      // LEVEL 3: Shield Defense Profiling
      // Tanks don't move or fire. Only shield matters.
      cppWrapper += `
    // Scenario 1: Enemy is firing -> should activate shield
    t.enemy.firing = true; t.shieldAction = "none"; t.defend();
    cout << "LEVEL3:FIRING:" << t.shieldAction << endl;

    // Scenario 2: Enemy not firing -> check behavior
    t.enemy.firing = false; t.shieldAction = "none"; t.defend();
    cout << "LEVEL3:QUIET:" << t.shieldAction << endl;

    // Scenario 3: Low HP, enemy firing -> should activate shield
    t.hp = 30.0; t.enemy.firing = true; t.shieldAction = "none"; t.defend();
    cout << "LEVEL3:LOWHP:" << t.shieldAction << endl;

    return 0;
}
`;
    } else {
      // LEVEL 4: Full Combat Profiling — movement + firing + shield
      cppWrapper += `
    // Scenario 1: Enemy above -> should move UP
    t.enemy.y = 20.0; t.y = 50.0; t.moveAction = "idle"; t.move();
    cout << "LEVEL4:ABOVE:" << t.moveAction << endl;

    // Scenario 2: Enemy below -> should move DOWN
    t.enemy.y = 80.0; t.y = 50.0; t.moveAction = "idle"; t.move();
    cout << "LEVEL4:BELOW:" << t.moveAction << endl;

    // Scenario 3: Enemy aligned -> should fire
    t.enemy.y = 50.0; t.y = 50.0; t.fireAction = "none"; t.attack();
    cout << "LEVEL4:ALIGNED:" << t.fireAction << endl;

    // Scenario 4: Enemy firing -> should activate shield
    t.enemy.firing = true; t.shieldAction = "none"; t.defend();
    cout << "LEVEL4:FIRING:" << t.shieldAction << endl;

    // Scenario 5: Low HP, enemy firing -> should shield
    t.hp = 30.0; t.enemy.firing = true; t.shieldAction = "none"; t.defend();
    cout << "LEVEL4:LOWHP:" << t.shieldAction << endl;

    return 0;
}
`;
    }

    // --- REAL COMPILER (JDoodle API) ---
    try {
      console.log('Sending request to JDoodle API...');

      const response = await firstValueFrom(
        this.httpService.post(this.JDOODLE_API_URL, {
          clientId: this.JDOODLE_CLIENT_ID,
          clientSecret: this.JDOODLE_CLIENT_SECRET,
          script: cppWrapper,
          language: 'cpp17',
          versionIndex: '0',
        })
      );

      console.log('Received response from JDoodle API');
      const result = response.data;

      // JDoodle returns: { output, statusCode, memory, cpuTime }
      if (result.statusCode === 200 || (!result.error && result.output !== undefined)) {
        const output = result.output || '';

        // Check if output contains compilation errors
        if (output.includes('error:') || output.includes('Error:')) {
          console.error('Compilation Error:', output);
          return { success: false, error: output };
        }

        console.log('Compilation successful');
        console.log('Output:', output);

        // Parse the actual output to derive a real profile
        const profile = this.deriveProfile(output, level);
        const finalOutput = profile ? `${output}\n${profile}` : output;

        return { success: true, output: finalOutput };
      } else {
        const errorMsg = result.error || result.output || 'Unknown Compilation Error';
        console.error('Compilation Error:', errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (error) {
      console.error('JDoodle API Error:', error.message);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      throw new Error(`Compiler API Error: ${error.message}`);
    }
  }

  /**
   * Derives a behavioral PROFILE line from the actual test scenario outputs.
   * This replaces the hardcoded template with real analysis of what the code does.
   */
  private deriveProfile(stdout: string, level: number): string | null {
    const lines = stdout.split('\n').map(l => l.trim()).filter(Boolean);

    if (level === 1) {
      // Check if code moves in different directions for different positions
      const s80 = lines.find(l => l.startsWith('LEVEL1:S80:'));
      const s20 = lines.find(l => l.startsWith('LEVEL1:S20:'));
      const s50 = lines.find(l => l.startsWith('LEVEL1:S50:'));
      const s50b = lines.find(l => l.startsWith('LEVEL1:S50B:'));
      const s30 = lines.find(l => l.startsWith('LEVEL1:S30:'));

      const getAction = (line: string | undefined) => line ? line.split(':')[2] : 'idle';

      const actions = [s80, s20, s50, s50b, s30].map(getAction);
      const hasUp = actions.includes('up');
      const hasDown = actions.includes('down');
      const hasIdle = actions.every(a => a === 'idle');

      if (hasUp && hasDown) {
        return 'PROFILE:track:none:none';
      } else if (hasUp && !hasDown) {
        return 'PROFILE:up:none:none';
      } else if (hasDown && !hasUp) {
        return 'PROFILE:down:none:none';
      } else if (hasIdle) {
        return 'PROFILE:idle:none:none';
      }
      // Fallback: if there's any non-idle action, assume track
      const hasAny = actions.some(a => a !== 'idle');
      return hasAny ? 'PROFILE:track:none:none' : 'PROFILE:idle:none:none';

    } else if (level === 2) {
      const above = lines.find(l => l.startsWith('LEVEL2:ABOVE:'));
      const below = lines.find(l => l.startsWith('LEVEL2:BELOW:'));
      const aligned = lines.find(l => l.startsWith('LEVEL2:ALIGNED:'));

      const getAction = (line: string | undefined) => line ? line.split(':')[2] : 'idle';

      // Movement profile
      let moveProfile = 'idle';
      const aboveAction = getAction(above);
      const belowAction = getAction(below);
      if (aboveAction === 'up' && belowAction === 'down') {
        moveProfile = 'track';
      } else if (aboveAction === 'up' || belowAction === 'up') {
        moveProfile = 'up';
      } else if (aboveAction === 'down' || belowAction === 'down') {
        moveProfile = 'down';
      }

      // Fire profile
      let fireProfile = 'none';
      const fireAction = getAction(aligned);
      if (fireAction === 'always') {
        fireProfile = 'align';
      }

      return `PROFILE:${moveProfile}:${fireProfile}:none`;

    } else if (level === 3) {
      // Level 3: Shield defense only - movement and firing don't apply
      const firing = lines.find(l => l.startsWith('LEVEL3:FIRING:'));
      const lowhp = lines.find(l => l.startsWith('LEVEL3:LOWHP:'));

      const getAction = (line: string | undefined) => line ? line.split(':')[2] : 'idle';

      // Shield profile
      let shieldProfile = 'none';
      const firingAction = getAction(firing);
      const lowhpAction = getAction(lowhp);
      if (firingAction === 'smart' || lowhpAction === 'smart') {
        shieldProfile = 'smart';
      }

      return `PROFILE:idle:none:${shieldProfile}`;
    } else {
      // Level 4: Full combat — derive all 3 profiles
      const above = lines.find(l => l.startsWith('LEVEL4:ABOVE:'));
      const below = lines.find(l => l.startsWith('LEVEL4:BELOW:'));
      const aligned = lines.find(l => l.startsWith('LEVEL4:ALIGNED:'));
      const firing = lines.find(l => l.startsWith('LEVEL4:FIRING:'));
      const lowhp = lines.find(l => l.startsWith('LEVEL4:LOWHP:'));

      const getAction = (line: string | undefined) => line ? line.split(':')[2] : 'idle';

      // Movement profile
      let moveProfile = 'idle';
      const aboveAction = getAction(above);
      const belowAction = getAction(below);
      if (aboveAction === 'up' && belowAction === 'down') {
        moveProfile = 'track';
      } else if (aboveAction === 'up' || belowAction === 'up') {
        moveProfile = 'up';
      } else if (aboveAction === 'down' || belowAction === 'down') {
        moveProfile = 'down';
      }

      // Fire profile
      let fireProfile = 'none';
      const fireAction = getAction(aligned);
      if (fireAction === 'always') {
        fireProfile = 'align';
      }

      // Shield profile
      let shieldProfile = 'none';
      const firingAction = getAction(firing);
      const lowhpAction = getAction(lowhp);
      if (firingAction === 'smart' || lowhpAction === 'smart') {
        shieldProfile = 'smart';
      }

      return `PROFILE:${moveProfile}:${fireProfile}:${shieldProfile}`;
    }
  }
}
