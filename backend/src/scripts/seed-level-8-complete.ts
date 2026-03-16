import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { AdminService } from '../admin/admin.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const adminService = app.get(AdminService);

  console.log('🚀 Seeding Level 8 (50 questions)...\n');

  const questions = [];
  const level = 8;
  let questionId = 801; // Starting from 801 for Level 8

  const add = (type: string, text: string, answer: string, opts?: string[]) => {
    questions.push({ 
      id: questionId++,
      level, 
      roundKey: 'round1', 
      type, 
      text, 
      correct: answer, 
      options: opts || null, 
      isActive: true 
    });
  };

  // Level 8 - All 50 Questions from document
  
  add('mcq', 'A Squad class manages multiple Soldier objects. What\'s the best approach?', 
    'Squad has an array/vector of Soldier pointers (composition)', 
    ['Squad inherits from Soldier', 'Squad has an array/vector of Soldier pointers (composition)', 'Soldier inherits from Squad', 'Use multiple inheritance']);

  add('output', `class A {
    int x;
    public:
        A(int a = 0) : x(a) { cout << x; }
        virtual ~A() { cout << x; }
};
class B : public A {
    int y;
    public:
        B(int a, int b) : A(a), y(b) { cout << y; }
        ~B() { cout << y; }
};
class C : public B {
    int z;
    public:
        C(int a, int b, int c) : B(a, b), z(c) { cout << z; }
        ~C() { cout << z; }
};
int main() {
    A *arr[2];
    arr[0] = new B(1, 2);
    arr[1] = new C(3, 4, 5);
    delete arr[0];
    delete arr[1];
    return 0;
}
What is the output?`, '1221345543');

  add('mcq', `class Weapon {
    char *name;
    public:
        Weapon(const char *n) {
            name = new char[strlen(n) + 1];
            strcpy(name, n);
        }
        ~Weapon() { delete[] name; }
};
What problem occurs with: Weapon w1("AK47"); Weapon w2 = w1;`, 
    'Double deletion - need custom copy constructor', 
    ['No problem', 'Double deletion - need custom copy constructor', 'Memory leak', 'Compilation error']);

  add('design', `class Base {
    public:
        void show() { cout << "Base"; }
};
class Derived : private Base {
    public:
        void display() { show(); }
};
Can you do: Derived d; Base *b = &d;`, 
    'No - private inheritance prevents conversion');

  add('mcq', 'A Command class needs to store history of all commands executed. What\'s best?', 
    'Static member variable in Command class', 
    ['Static member variable in Command class', 'Global variable', 'Each object stores full history', 'Friend function with static variable']);

  add('output', `class Test {
    int x;
    public:
        Test(int a = 0) : x(a) { cout << x; }
        Test(const Test &t) : x(t.x * 2) { cout << x; }
        ~Test() { cout << x; }
};
Test func(Test t) {
    Test temp(10);
    return temp;
}
int main() {
    Test t1(3);
    Test t2 = func(t1);
    return 0;
}
What is the output?`, '3610101066633');

  add('mcq', `class Mission {
    public:
        virtual void execute() = 0;
        void launch() { execute(); }
};
class StealthMission : public Mission {
    public:
        void execute() { cout << "Stealth"; }
};
What happens with: Mission m;`, 
    'Compilation error - cannot instantiate abstract class', 
    ['Works fine', 'Compilation error - cannot instantiate abstract class', 'Runtime error', 'Calls execute()']);

  add('error', `class Soldier {
    int *health;
    public:
        Soldier(int h) : health(new int(h)) {}
        virtual ~Soldier() { delete health; }
};
class Sniper : public Soldier {
    int *ammo;
    public:
        Sniper(int h, int a) : Soldier(h), ammo(new int(a)) {}
};
int main() {
    Soldier *s = new Sniper(100, 50);
    delete s;
    return 0;
}
What is the error?`, 'Sniper destructor missing - ammo not deleted, memory leak');

  add('mcq', 'You need to prevent a class from being inherited. What should you do?', 
    'Make constructor private', 
    ['Make constructor private', 'Make destructor private', 'Use final keyword', 'Cannot prevent inheritance']);

  add('design', `class A {
    protected:
        int x;
    public:
        A(int a) : x(a) {}
};
class B : public A {
    public:
        B(int a) : A(a) {}
        void show() { cout << x; }
};
Can class B access x?`, 
    'Yes - x is protected, accessible in derived class');

  add('output', `class Counter {
    static int count;
    int id;
    public:
        Counter() : id(count++) { cout << id; }
        Counter(const Counter &c) : id(count++) { cout << id; }
        ~Counter() { cout << id; count--; }
};
int Counter::count = 5;
int main() {
    Counter c1;
    Counter c2 = c1;
    {
        Counter c3;
    }
    return 0;
}
What is the output?`, '5677665');

  add('mcq', `class Operative {
    public:
        virtual void attack() { cout << "Basic"; }
};
class Sniper : public Operative {
    public:
        void attack() { cout << "Snipe"; }
};
What is output of: Operative *o = new Sniper(); o->attack();`, 
    'Snipe', 
    ['Basic', 'Snipe', 'BasicSnipe', 'Compilation error']);

  add('design', 'A Vehicle class has engine, wheels, fuel. A Tank class needs these plus armor, cannon. Best approach?', 
    'Tank inherits from Vehicle', 
    ['Tank inherits from Vehicle', 'Vehicle inherits from Tank', 'Both inherit from common base', 'No inheritance, duplicate code']);

  add('output', `class A {
    public:
        virtual void func(int x = 5) { cout << x * 2; }
};
class B : public A {
    public:
        void func(int x = 10) { cout << x * 3; }
};
class C : public B {
    public:
        void func(int x = 15) { cout << x * 4; }
};
int main() {
    A *p = new C();
    p->func();
    return 0;
}
What is the output?`, '20');

  add('mcq', `class Equipment {
    int *durability;
    public:
        Equipment(int d) : durability(new int(d)) {}
        Equipment(const Equipment &e) : durability(e.durability) {}
        ~Equipment() { delete durability; }
};
What's wrong with the copy constructor?`, 
    'Shallow copy - will cause double deletion', 
    ['Nothing', 'Shallow copy - will cause double deletion', 'Missing return statement', 'Should use deep copy with new']);

  add('design', `class Base {
    public:
        void show() { cout << "B1"; }
        virtual void show(int x) { cout << "B2"; }
};
class Derived : public Base {
    public:
        void show(int x) { cout << "D"; }
};
What happens with: Derived d; d.show();`, 
    'Compilation error - show() is hidden');

  add('output', `class Test {
    int val;
    public:
        Test(int v = 0) : val(v) { cout << val; }
        Test& operator++() { val += 2; return *this; }
        Test operator++(int) { Test t = *this; val += 3; return t; }
        int get() { return val; }
};
int main() {
    Test t(5);
    cout << (++t).get();
    cout << (t++).get();
    cout << t.get();
    return 0;
}
What is the output?`, '5771010');

  add('mcq', 'A Rank class should be compared (==, <, >). What\'s the best way?', 
    'Member operator overloading', 
    ['Global functions', 'Member operator overloading', 'Friend operator overloading', 'Cannot overload comparison operators']);

  add('error', `class Team {
    static int memberCount;
    public:
        Team() { memberCount++; }
        ~Team() { memberCount--; }
        int getCount() { return memberCount; }
};
int main() {
    Team t1, t2;
    cout << t1.getCount();
    return 0;
}
What is the error?`, 'memberCount not initialized outside class');

  add('mcq', `class A {
    int x;
    public:
        A(int a) : x(a) {}
        void modify() const { x = 10; }
};
What's wrong?`, 
    'Cannot modify x in const member function', 
    ['Nothing', 'Cannot modify x in const member function', 'x should be static', 'Missing return type']);

  add('output', `class A {
    int x;
    public:
        A(int a = 0) : x(a) { cout << x; }
        A(const A &a) : x(a.x + a.x) { cout << x; }
        ~A() { cout << x; }
};
int main() {
    A a1(3);
    A a2 = a1;
    A a3 = a2;
    A a4(a3);
    return 0;
}
What is the output?`, '36122424241266633');

  add('mcq', 'You need a Singleton class (only one instance). What\'s essential?', 
    'Private constructor', 
    ['Private constructor', 'Public constructor', 'Virtual destructor', 'Multiple constructors']);

  add('design', `class Base {
    public:
        Base() { cout << "B"; }
        ~Base() { cout << "~B"; }
};
class Derived : public Base {
    public:
        Derived() { cout << "D"; }
        ~Derived() { cout << "~D"; }
};
What is output of: Base *b = new Derived(); delete b;`, 
    'BD~B (Derived destructor not called - need virtual)');

  add('mcq', 'A Weapon class has name, damage, ammo. You want to prevent copying. Best approach?', 
    'Make copy constructor private or delete it', 
    ['Make copy constructor public', 'Make copy constructor private or delete it', 'Don\'t define copy constructor', 'Use virtual copy constructor']);

  add('output', `class Base1 {
    public:
        Base1() { cout << "1"; }
        virtual ~Base1() { cout << "~1"; }
};
class Base2 {
    public:
        Base2() { cout << "2"; }
        virtual ~Base2() { cout << "~2"; }
};
class Derived : public Base2, public Base1 {
    public:
        Derived() { cout << "D"; }
        ~Derived() { cout << "~D"; }
};
int main() {
    Base1 *b = new Derived();
    delete b;
    return 0;
}
What is the output?`, '21D~D~1~2');

  add('design', 'You have Soldier, Medic, Engineer classes. They all need getName(), getRank(). Best approach?', 
    'Create Person base class with these methods', 
    ['Duplicate code in each', 'Create Person base class with these methods', 'Use friend functions', 'Use global functions']);

  add('mcq', `class Array {
    int *data;
    int size;
    public:
        Array(int s) : size(s), data(new int[s]) {}
        ~Array() { delete data; }
};
What's wrong with destructor?`, 
    'Should use delete[] data', 
    ['Nothing', 'Should use delete[] data', 'Should use free(data)', 'Missing size deletion']);

  add('design', `class A {
    public:
        virtual void func() { cout << "A"; }
        A() { func(); }
};
class B : public A {
    public:
        void func() { cout << "B"; }
};
What is output of: B obj;`, 
    'A (virtual function uses static binding in constructor)');

  add('output', `class Test {
    int x;
    public:
        Test(int a = 0) : x(a) { cout << x; }
        void set(int a) { x = a; cout << x; }
        void add(int a) { x += a; cout << x; }
        void mult(int a) { x *= a; cout << x; }
        ~Test() { cout << x; }
};
int main() {
    Test t(2);
    t.set(5);
    t.add(3);
    t.mult(2);
    return 0;
}
What is the output?`, '2581616016');

  add('mcq', 'Multiple classes need to use the same database connection. Best approach?', 
    'Singleton Database class with static instance', 
    ['Each class creates own connection', 'Singleton Database class with static instance', 'Pass connection to each class', 'Global database object']);

  add('error', `class Mission {
    public:
        virtual void execute() = 0;
        virtual void report() = 0;
};
class RescueMission : public Mission {
    public:
        void execute() { cout << "Rescue"; }
};
int main() {
    RescueMission rm;
    return 0;
}
What is the error?`, 'report() not overridden - RescueMission still abstract');

  add('mcq', `class Vehicle {
    protected:
        int speed;
    public:
        Vehicle(int s) : speed(s) {}
};
class Car : private Vehicle {
    public:
        Car(int s) : Vehicle(s) {}
        void show() { cout << speed; }
};
What happens with: Car c(100); Vehicle *v = &c;`, 
    'Compilation error - private inheritance', 
    ['Works fine', 'Compilation error - private inheritance', 'Runtime error', 'speed becomes private']);

  add('output', `class A {
    public:
        A() { cout << "A"; }
        virtual ~A() { cout << "~A"; }
};
class B : public A {
    public:
        B() { cout << "B"; }
        ~B() { cout << "~B"; }
};
class C : public B {
    public:
        C() { cout << "C"; }
        ~C() { cout << "~C"; }
};
int main() {
    A *arr[2];
    arr[0] = new B();
    arr[1] = new C();
    delete arr[0];
    delete arr[1];
    return 0;
}
What is the output?`, 'ABABC~B~A~C~B~A');

  add('design', `class Base {
    public:
        void func() { cout << "B1"; }
        void func(int x) { cout << "B2"; }
};
class Derived : public Base {
    public:
        void func(int x, int y) { cout << "D"; }
};
Can you call: Derived d; d.func();`, 
    'No - all func versions are hidden');

  add('mcq', 'A Logger class should write to only one log file. Multiple objects shouldn\'t create multiple files. Best pattern?', 
    'Singleton', 
    ['Singleton', 'Multiple inheritance', 'Virtual functions', 'Friend classes']);

  add('output', `class Counter {
    static int count;
    public:
        Counter() { cout << count++; }
        Counter(const Counter&) { cout << count++; }
        ~Counter() { cout << --count; }
};
int Counter::count = 3;
int main() {
    Counter c1;
    Counter c2 = c1;
    Counter c3(c2);
    return 0;
}
What is the output?`, '345543');

  add('design', 'You need to model: Soldier, Tank, Helicopter - all can attack(). Best approach?', 
    'Combatant base class with virtual attack()', 
    ['Each class separate, duplicate attack()', 'Combatant base class with virtual attack()', 'Use friend functions', 'Global attack() function']);

  add('mcq', `class Test {
    public:
        Test(int x) { cout << "P"; }
        Test() { cout << "D"; }
};
What is output of: Test t;`, 
    'D', 
    ['P', 'D', 'PD', 'DP']);

  add('error', `class Weapon {
    int *ammo;
    public:
        Weapon(int a) : ammo(new int(a)) {}
        Weapon(const Weapon &w) {
            ammo = new int(*w.ammo);
        }
        ~Weapon() { delete ammo; }
};
int main() {
    Weapon w1(50);
    Weapon w2(100);
    w1 = w2;
    return 0;
}
What is the error?`, 'No assignment operator - memory leak when w1\'s old ammo is lost');

  add('output', `class Number {
    int val;
    public:
        Number(int v = 0) : val(v) {}
        Number operator+(Number n) { return Number(val + n.val); }
        Number operator*(Number n) { return Number(val * n.val); }
        friend ostream& operator<<(ostream &o, Number n) {
            o << n.val;
            return o;
        }
};
int main() {
    Number n1(2), n2(3), n3(4), n4(5);
    cout << (n1 + n2) * (n3 + n4);
    return 0;
}
What is the output?`, '45');

  add('mcq', 'A Squad class manages Soldiers. When Squad is destroyed, should Soldiers be destroyed?', 
    'Depends on design', 
    ['Yes - Squad owns Soldiers (composition)', 'No - Soldiers exist independently', 'Depends on design', 'Cannot be determined']);

  add('design', `class A {
    int x;
    public:
        A(int a) : x(a) {}
};
class B : public A {
    public:
        B() : x(10) {}
};
What's wrong with class B?`, 
    'Cannot initialize x directly, must call A\'s constructor');

  add('output', `class Test {
    public:
        Test() { cout << "C"; }
        Test(int x) { cout << "P" << x; }
        Test(const Test&) { cout << "CC"; }
        Test& operator=(const Test&) { cout << "="; return *this; }
        ~Test() { cout << "D"; }
};
int main() {
    Test t1;
    Test t2(5);
    Test t3;
    t1 = t2;
    t3 = t1;
    return 0;
}
What is the output?`, 'CP5C==DDD');

  add('mcq', `class Mission {
    public:
        virtual void brief() { cout << "Mission"; }
};
class StealthMission : public Mission {
    public:
        void brief() { cout << "Stealth"; }
};
What happens with: Mission m = StealthMission(); m.brief();`, 
    'Outputs "Mission"', 
    ['Outputs "Stealth"', 'Outputs "Mission"', 'Compilation error', 'Runtime error']);

  add('design', 'You\'re modeling a game inventory. Items have name, weight, value. Some items are Weapons (damage), some are Armor (defense). Best approach?', 
    'Item base class, Weapon and Armor inherit', 
    ['Item base class, Weapon and Armor inherit', 'Weapon and Armor separate, no inheritance', 'Multiple inheritance from Item', 'All in one class']);

  add('output', `class A {
    public:
        virtual void func() { cout << "A"; }
        void call() { func(); }
};
class B : public A {
    public:
        void func() { cout << "B"; }
};
class C : public B {
    public:
        void func() { cout << "C"; }
};
int main() {
    A *arr[3];
    arr[0] = new A();
    arr[1] = new B();
    arr[2] = new C();
    arr[0]->call();
    arr[1]->call();
    arr[2]->call();
    return 0;
}
What is the output?`, 'ABC');

  add('mcq', 'A Config class stores game settings. You want only one instance throughout the game. Essential requirement?', 
    'Private constructor and static getInstance()', 
    ['Virtual destructor', 'Private constructor and static getInstance()', 'Protected constructor', 'Multiple constructors']);

  add('error', `class Calculator {
    public:
        int add(int a, int b) { return a + b; }
        float add(int a, int b) { return a + b; }
};
What is the error?`, 'Cannot overload only on return type - same parameter list');

  add('output', `class Test {
    int val;
    public:
        Test(int v) : val(v) { cout << val; }
        Test(const Test &t) : val(t.val * 3) { cout << val; }
        ~Test() { cout << val; }
};
int main() {
    Test t1(2);
    Test t2 = t1;
    Test t3 = t2;
    return 0;
}
What is the output?`, '261818186622');

  add('mcq', `class Soldier {
    public:
        int health;
        Soldier() { health = 100; }
};
class Medic : virtual public Soldier {};
class Engineer : virtual public Soldier {};
class SpecialOps : public Medic, public Engineer {};
What happens with: SpecialOps s; cout << s.health;`, 
    'Outputs 100', 
    ['Compilation error - ambiguous', 'Outputs 100', 'Outputs 200', 'Undefined']);

  console.log(`✅ Level 8: ${questions.length} questions prepared`);
  console.log('\n💾 Seeding Level 8 questions to database...');
  await adminService.seedQuestions(questions);
  
  console.log('\n🎉 Level 8 seeding completed!');
  console.log(`📊 Questions seeded: ${questions.length}`);

  await app.close();
}

bootstrap().catch(err => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
