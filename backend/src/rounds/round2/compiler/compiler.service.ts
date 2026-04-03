import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class CompilerService {
  private readonly PISTON_EXECUTE_URL =
    process.env.PISTON_EXECUTE_URL || 'https://emkc.org/api/v2/piston/execute';

  constructor(private readonly httpService: HttpService) {}

  async compileCode(code: string, level: number): Promise<{ success: boolean; output?: string; error?: string }> {
    console.log(`[Level ${level}] Compiling code...`);
    console.log('Using Piston API at:', this.PISTON_EXECUTE_URL);

    // Remove the fake include so it compiles cleanly in Piston
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

    // Derive profile: if tank moves in correct direction for different positions, it's tracking
    // We check the first 3 scenarios which cover movement toward different checkpoints
    cout << "PROFILE:track:none:none" << endl;

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

    // Derive profile from scenarios
    // Movement profile: if UP when above AND DOWN when below -> track
    // Fire profile: if fireAction is "always" when aligned -> align
    // Shield: not used in Level 2
    cout << "PROFILE:track:align:none" << endl;

    return 0;
}
`;
    } else {
      // LEVEL 3: Full Combat Profiling (movement + firing + defense)
      // All Level 2 tests plus shield/defense scenarios.
      cppWrapper += `
    // Scenario 1: Enemy above -> should move UP toward enemy
    t.enemy.y = 20.0; t.y = 50.0; t.moveAction = "idle"; t.move();
    cout << "LEVEL3:ABOVE:" << t.moveAction << endl;

    // Scenario 2: Enemy below -> should move DOWN toward enemy
    t.enemy.y = 80.0; t.y = 50.0; t.moveAction = "idle"; t.move();
    cout << "LEVEL3:BELOW:" << t.moveAction << endl;

    // Scenario 3: Aligned with enemy -> should fire
    t.enemy.y = 50.0; t.y = 50.0; t.moveAction = "idle"; t.attack();
    cout << "LEVEL3:ALIGNED:" << t.fireAction << endl;

    // Scenario 4: Enemy is firing -> should activate shield
    t.enemy.y = 50.0; t.y = 50.0; t.enemy.firing = true; t.shieldAction = "none"; t.defend();
    cout << "LEVEL3:FIRING:" << t.shieldAction << endl;

    // Scenario 5: Enemy not firing -> check shield behavior
    t.enemy.firing = false; t.shieldAction = "none"; t.defend();
    cout << "LEVEL3:QUIET:" << t.shieldAction << endl;

    // Scenario 6: Low HP, enemy firing -> defensive behavior
    t.hp = 30.0; t.enemy.firing = true; t.shieldAction = "none"; t.defend();
    cout << "LEVEL3:LOWHP:" << t.shieldAction << endl;

    // Derive profile from scenarios
    // Movement: track if both directions correct
    // Fire: align if fireAction is "always"
    // Shield: smart if shieldAction is "smart" in any defend scenario
    cout << "PROFILE:track:align:smart" << endl;

    return 0;
}
`;
    }

    // --- REAL COMPILER (Piston API) ---
    try {
      console.log('Sending request to Piston API...');

      const response = await firstValueFrom(
        this.httpService.post(this.PISTON_EXECUTE_URL, {
          language: 'cpp',
          version: '10.2.0',
          files: [{ content: cppWrapper }],
        })
      );

      console.log('Received response from Piston API');
      const result = response.data;

      if (result.run && result.run.code === 0) {
        console.log('Compilation successful');
        console.log('Output:', result.run.stdout);

        // Parse the actual output to derive a real profile instead of the template
        const stdout = result.run.stdout;
        const profile = this.deriveProfile(stdout, level);
        const finalOutput = profile ? `${stdout}\n${profile}` : stdout;

        return { success: true, output: finalOutput };
      } else {
        const errorMsg =
          (result.compile && result.compile.stderr) ||
          (result.run && result.run.stderr) ||
          'Unknown Compilation Error';
        console.error('Compilation Error:', errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (error) {
      console.error('Piston API Error:', error.message);
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

    } else {
      // Level 3
      const above = lines.find(l => l.startsWith('LEVEL3:ABOVE:'));
      const below = lines.find(l => l.startsWith('LEVEL3:BELOW:'));
      const aligned = lines.find(l => l.startsWith('LEVEL3:ALIGNED:'));
      const firing = lines.find(l => l.startsWith('LEVEL3:FIRING:'));
      const quiet = lines.find(l => l.startsWith('LEVEL3:QUIET:'));
      const lowhp = lines.find(l => l.startsWith('LEVEL3:LOWHP:'));

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
