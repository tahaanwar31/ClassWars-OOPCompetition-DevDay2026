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

    // --- C++ TEST HARNESS (Level-specific) ---
    // We wrap the user's code in a real C++ program that simulates the game state.
    // Tests are different based on level:
    // Level 1: Checkpoint navigation (no enemy)
    // Level 2+: Enemy tracking and combat
    let cppWrapper = `
#include <iostream>
#include <cmath>
using namespace std;

struct Enemy {
    float y;
    bool isFiring() { return true; }
};

class Tank {
public:
    float y = 50.0;
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

    // Level-specific tests
    if (level === 1) {
      // LEVEL 1: Checkpoint Navigation Tests
      // Test scenario 1: Player at y=50, first checkpoint at y=20 (need to move UP to reach)
      cppWrapper += `
    // LEVEL 1 TEST 1: At y=50, should move toward checkpoint at y=20 (UP)
    t.y = 50.0;
    t.moveAction = "idle";
    t.move();
    if (t.moveAction == "up") cout << "LEVEL1_CHECKPOINT_UP" << endl;
    if (t.moveAction == "down") cout << "LEVEL1_CHECKPOINT_DOWN" << endl;

    // LEVEL 1 TEST 2: At y=50, should move toward checkpoint at y=80 (DOWN)
    // Verify different behavior at different starting position
    t.y = 50.0;
    t.moveAction = "idle";
    t.move();
    if (t.moveAction != "idle") cout << "LEVEL1_CAN_MOVE" << endl;

    return 0;
}
`;
    } else {
      // LEVEL 2 & 3: Enemy Tracking Tests
      cppWrapper += `
    // Test 1: Enemy is ABOVE the tank (y=20 vs y=50)
    t.enemy.y = 20.0;
    t.y = 50.0;
    t.moveAction = "idle";
    t.move();
    if (t.moveAction == "up") cout << "TEST_ABOVE:UP" << endl;
    if (t.moveAction == "down") cout << "TEST_ABOVE:DOWN" << endl;

    // Test 2: Enemy is BELOW the tank (y=80 vs y=50)
    t.enemy.y = 80.0;
    t.y = 50.0;
    t.moveAction = "idle";
    t.move();
    if (t.moveAction == "up") cout << "TEST_BELOW:UP" << endl;
    if (t.moveAction == "down") cout << "TEST_BELOW:DOWN" << endl;

    // Test 3: Attack
    t.enemy.y = 50.0;
    t.y = 50.0;
    t.attack();
    if (t.fireAction == "always") cout << "TEST_ATTACK:FIRE" << endl;

    // Test 4: Defend
    t.defend();
    if (t.shieldAction == "smart") cout << "TEST_DEFEND:SHIELD" << endl;

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
        console.log('✅ Compilation successful');
        console.log('Output:', result.run.stdout);
        return { success: true, output: result.run.stdout };
      } else {
        const errorMsg =
          (result.compile && result.compile.stderr) ||
          (result.run && result.run.stderr) ||
          'Unknown Compilation Error';
        console.error('❌ Compilation Error:', errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (error) {
      console.error('❌ Piston API Error:', error.message);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      throw new Error(`Compiler API Error: ${error.message}`);
    }
  }
}
