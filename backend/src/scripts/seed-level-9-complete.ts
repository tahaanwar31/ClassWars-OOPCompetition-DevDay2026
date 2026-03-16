import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { AdminService } from '../admin/admin.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const adminService = app.get(AdminService);

  console.log('🚀 Seeding Level 9 (50 questions)...\n');

  const questions = [];
  const level = 9;
  let questionId = 901; // Starting from 901 for Level 9

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

  // Level 9 - All 50 Questions
  
  add('design', 'You\'re building a command system. Commander gives orders, Soldier executes them. Best OOP approach?', 
    'Command pattern - Order base class with execute(), different order types inherit', 
    ['Single Command class with if-else for order types', 'Global functions for each order', 'Command pattern - Order base class with execute(), different order types inherit', 'Commander has execute() method']);

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
class D : public C {
    int w;
    public:
        D(int a, int b, int c, int d) : C(a, b, c), w(d) { cout << w; }
        ~D() { cout << w; }
};
int main() {
    B *arr[2];
    arr[0] = new C(1, 2, 3);
    arr[1] = new D(4, 5, 6, 7);
    delete arr[0];
    delete arr[1];
    return 0;
}
What is the output?`, '12345676765544332211');

  add('mcq', `class Resource {
    int *data;
    public:
        Resource(int d) : data(new int(d)) {}
        Resource(const Resource &r) : data(r.data) {}
        ~Resource() { delete data; }
};
What happens when: Resource r1(10); Resource r2 = r1; objects destroyed?`, 
    'Double deletion of data', 
    ['Memory leak in r2', 'data becomes NULL', 'No problem - works fine', 'Double deletion of data']);

  add('design', 'A Loadout class stores Weapon, Armor, Gadgets. Weapon might be shared across Loadouts. Best approach?', 
    'Loadout has Weapon pointer (aggregation, doesn\'t own)', 
    ['Deep copy Weapon in every Loadout', 'Loadout inherits from Weapon', 'Loadout has Weapon pointer (aggregation, doesn\'t own)', 'Loadout owns Weapon (composition with new/delete)']);

  add('mcq', `class Base {
    public:
        void func() { cout << "B1"; }
        virtual void func(int x) { cout << "B2"; }
};
class Derived : public Base {
    public:
        void func() { cout << "D1"; }
        void func(int x) { cout << "D2"; }
};
What happens with: Derived d; d.func(5);`, 
    'Outputs "D2"', 
    ['Compilation error - func hidden', 'Outputs "D2"', 'Outputs "B2"', 'Outputs "D1D2"']);

  add('output', `class Test {
    int x;
    public:
        Test(int a = 0) : x(a) { cout << x; }
        Test(const Test &t) : x(t.x + t.x + t.x) { cout << x; }
        ~Test() { cout << x; }
};
int main() {
    Test t1(2);
    Test t2 = t1;
    Test t3 = t2;
    Test t4 = t3;
    return 0;
}
What is the output?`, '26185454541886622');

  add('design', 'Mission objectives: Eliminate, Rescue, Defend. All have complete() method but different implementations. Best approach?', 
    'Objective base class with virtual complete()', 
    ['One Objective class with type enum and switch', 'Global functions for each type', 'Objective base class with virtual complete()', 'Three separate classes, no inheritance']);

  add('error', `class Vehicle {
    int *fuel;
    public:
        Vehicle(int f) : fuel(new int(f)) {}
        Vehicle(const Vehicle &v) : fuel(new int(*v.fuel)) {}
        virtual ~Vehicle() { delete fuel; }
};
class Tank : public Vehicle {
    int *armor;
    public:
        Tank(int f, int a) : Vehicle(f), armor(new int(a)) {}
        Tank(const Tank &t) : Vehicle(t), armor(new int(*t.armor)) {}
};
int main() {
    Tank t1(100, 200);
    Tank t2 = t1;
    return 0;
}
What is the error?`, 'Tank destructor missing - armor not deleted');

  add('mcq', `class A {
    public:
        virtual void show() const { cout << "A"; }
};
class B : public A {
    public:
        void show() { cout << "B"; }
};
What happens with: const A *a = new B(); a->show();`, 
    'Outputs "A"', 
    ['Outputs "B"', 'Runtime error', 'Compilation error', 'Outputs "A"']);

  add('design', `class Inventory {
    static int totalItems;
    public:
        Inventory() { totalItems++; }
        ~Inventory() { totalItems--; }
        static int getTotal() { return totalItems; }
};
What's missing?`, 
    'totalItems not initialized outside class');

  add('output', `class A {
    public:
        virtual void func(int x = 3) { cout << x * x; }
};
class B : public A {
    public:
        void func(int x = 5) { cout << x + x; }
};
class C : public B {
    public:
        void func(int x = 7) { cout << x - x; }
};
int main() {
    A *p1 = new B();
    A *p2 = new C();
    B *p3 = new C();
    p1->func();
    p2->func();
    p3->func();
    return 0;
}
What is the output?`, '6010');

  add('mcq', 'A TeamComms class manages radio channels. Only one TeamComms should exist. Which pattern?', 
    'Singleton with private constructor and static getInstance()', 
    ['Abstract class', 'Virtual base class', 'Multiple inheritance', 'Singleton with private constructor and static getInstance()']);

  add('design', 'Soldier, Medic, Engineer all inherit from Person. You need a function to heal() that only Medic can do. Where should it be?', 
    'Only in Medic class', 
    ['As virtual function in Person', 'In Person base class', 'Only in Medic class', 'In Soldier and Medic']);

  add('output', `class Counter {
    static int count;
    int id;
    public:
        Counter() : id(++count) { cout << id; }
        Counter(const Counter &c) : id(++count) { cout << id; }
        ~Counter() { cout << id; --count; }
};
int Counter::count = 2;
int main() {
    Counter c1;
    {
        Counter c2 = c1;
        {
            Counter c3 = c2;
        }
        Counter c4;
    }
    return 0;
}
What is the output?`, '34566543');

  add('mcq', `class Weapon {
    public:
        void fire() { cout << "Bang"; }
};
class Rifle : private Weapon {
    public:
        void shoot() { fire(); }
};
What happens with: Rifle r; Weapon *w = &r;`, 
    'Compilation error - private inheritance prevents conversion', 
    ['Runtime error', 'fire() becomes private', 'Compilation error - private inheritance prevents conversion', 'Works fine']);

  add('design', `class Base {
    public:
        Base() { cout << "B"; }
        virtual ~Base() { cout << "~B"; }
};
class Derived : public Base {
    public:
        Derived() { cout << "D"; }
        ~Derived() { cout << "~D"; }
};
What is output of: Base *b = new Derived(); delete b;`, 
    'BD~D~B');

  add('output', `class Test {
    int val;
    public:
        Test(int v = 0) : val(v) { cout << val; }
        Test& operator+=(int n) { val += n; return *this; }
        Test& operator-=(int n) { val -= n; return *this; }
        ~Test() { cout << val; }
};
int main() {
    Test t(10);
    (t += 5) -= 3;
    return 0;
}
What is the output?`, '101212');

  add('design', 'You have Helicopter, Jet, Drone - all can fly(). Best way to model?', 
    'Aircraft base class with virtual fly()', 
    ['Global fly() function', 'Each class separate, duplicate fly()', 'Aircraft base class with virtual fly()', 'Multiple inheritance from Flying']);

  add('error', `class Game {
    public:
        virtual void start() = 0;
        virtual void update() = 0;
};
class ShooterGame : public Game {
    public:
        void start() { cout << "Start"; }
};
int main() {
    ShooterGame sg;
    return 0;
}
What is the error?`, 'update() not overridden - ShooterGame still abstract');

  add('mcq', `class Array {
    int *arr;
    int size;
    public:
        Array(int s) : size(s), arr(new int[s]) {}
        ~Array() { delete arr; }
};
What's the problem?`, 
    'Should use delete[] arr', 
    ['Missing copy constructor only', 'arr should be public', 'Should use delete[] arr', 'Nothing']);

  add('output', `class A {
    int x;
    public:
        A(int a = 0) : x(a) { cout << x; }
        A(const A &a) : x(a.x * a.x) { cout << x; }
        ~A() { cout << x; }
};
int main() {
    A a1(3);
    A a2 = a1;
    A a3 = a2;
    A a4(a3);
    return 0;
}
What is the output?`, '3981656181656581993');

  add('design', 'A Squad manages up to 4 Soldiers. When Squad is destroyed, Soldiers should be destroyed. Best approach?', 
    'Squad has Soldier array (composition)', 
    ['Global Soldier array', 'Soldier inherits from Squad', 'Squad has Soldier* array (aggregation)', 'Squad has Soldier array (composition)']);

  add('mcq', `class Test {
    public:
        Test(int x) { cout << "P"; }
};
What happens with: Test t;`, 
    'Compilation error - no default constructor', 
    ['Outputs "P"', 'Outputs nothing', 'Compilation error - no default constructor', 'Calls default constructor']);

  add('design', 'You need to log all operations. Multiple classes need logging. Best approach?', 
    'Logger singleton class, all classes use it', 
    ['Inheritance from Logger', 'Each class has its own log file', 'Copy Logger into each class', 'Logger singleton class, all classes use it']);

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
class Base3 {
    public:
        Base3() { cout << "3"; }
        virtual ~Base3() { cout << "~3"; }
};
class Derived : public Base1, public Base3, public Base2 {
    public:
        Derived() { cout << "D"; }
        ~Derived() { cout << "~D"; }
};
int main() {
    Base2 *b = new Derived();
    delete b;
    return 0;
}
What is the output?`, '132D~D~2~3~1');

  add('mcq', `class Soldier {
    int health;
    public:
        Soldier(int h) : health(h) {}
        void setHealth(int h) const { health = h; }
};
What's wrong?`, 
    'Cannot modify health in const function', 
    ['Missing destructor', 'health should be public', 'Cannot modify health in const function', 'Nothing']);

  add('design', `class A {
    public:
        void show() { cout << "A1"; }
        virtual void display() { cout << "A2"; }
};
class B : public A {
    public:
        void show() { cout << "B1"; }
        void display() { cout << "B2"; }
};
What is output of: A *a = new B(); a->show(); a->display();`, 
    'A1B2');

  add('output', `class Test {
    int x;
    public:
        Test(int a = 0) : x(a) { cout << x; }
        void add(int a) { x += a; cout << x; }
        void sub(int a) { x -= a; cout << x; }
        void mult(int a) { x *= a; cout << x; }
        ~Test() { cout << x; }
};
int main() {
    Test t(5);
    t.add(3);
    t.sub(2);
    t.mult(3);
    return 0;
}
What is the output?`, '5861818018');

  add('error', `class List {
    int *data;
    int size;
    public:
        List(int s) : size(s), data(new int[s]) {}
        List(const List &l) : size(l.size), data(new int[l.size]) {
            for(int i = 0; i < size; i++)
                data[i] = l.data[i];
        }
        ~List() { delete data; }
};
What is the error?`, 'Should use delete[] data');

  add('design', 'Mission has start(), execute(), complete(). Different mission types have different execute(). Best approach?', 
    'Mission base class with virtual execute()', 
    ['Multiple inheritance', 'Global functions for each type', 'One Mission class with type parameter and switch', 'Mission base class with virtual execute()']);

  add('mcq', `class A {
    public:
        A() { cout << "A"; }
        ~A() { cout << "~A"; }
};
class B {
    A a1, a2;
    public:
        B() { cout << "B"; }
        ~B() { cout << "~B"; }
};
What is output of: B obj;`, 
    'AAB~B~A~A', 
    ['AB~B~A', 'AAB~B~A', 'AAB~B~A~A', 'BAA~A~A~B']);

  add('output', `class Number {
    int val;
    public:
        Number(int v = 0) : val(v) {}
        Number operator+(Number n) { return Number(val + n.val); }
        Number operator-(Number n) { return Number(val - n.val); }
        Number operator*(Number n) { return Number(val * n.val); }
        friend ostream& operator<<(ostream &o, Number n) {
            o << n.val;
            return o;
        }
};
int main() {
    Number n1(10), n2(3), n3(2);
    cout << (n1 - n2) * n3 + n1;
    return 0;
}
What is the output?`, '24');

  add('design', 'A Config class stores game settings. Multiple systems access it. Only one instance should exist. What do you need?', 
    'Private constructor + static getInstance()', 
    ['Virtual constructor', 'Protected constructor', 'Private constructor + static getInstance()', 'Public constructor']);

  add('mcq', `class Weapon {
    public:
        void fire() { cout << "Fire"; }
};
class Soldier {
    Weapon w;
    public:
        void attack() { w.fire(); }
};
This is an example of:`, 
    'Composition', 
    ['Polymorphism', 'Multiple inheritance', 'Composition', 'Inheritance']);

  add('output', `class Test {
    public:
        Test() { cout << "C"; }
        Test(int x) { cout << "P" << x; }
        Test(double x) { cout << "D"; }
        Test(const Test&) { cout << "CC"; }
        ~Test() { cout << "X"; }
};
int main() {
    Test t1;
    Test t2(5);
    Test t3(3.14);
    Test t4 = t1;
    return 0;
}
What is the output?`, 'CP5DCCXXXX');

  add('error', `class Mission {
    public:
        virtual void brief() = 0;
        virtual void execute() = 0;
        virtual void report() = 0;
};
class Assault : public Mission {
    public:
        void brief() { cout << "Brief"; }
        void execute() { cout << "Execute"; }
};
int main() {
    Assault a;
    return 0;
}
What is the error?`, 'report() not overridden - Assault still abstract');

  add('mcq', `class A {
    int x;
    public:
        A(int a) : x(a) {}
};
class B : public A {
    public:
        B(int a) {}
};
What's wrong with class B?`, 
    'Base class constructor not called - compilation error', 
    ['x is private', 'Missing destructor', 'Base class constructor not called - compilation error', 'Nothing']);

  add('design', `class Base {
    public:
        Base() { cout << "B"; func(); }
        virtual void func() { cout << "b"; }
};
class Derived : public Base {
    public:
        Derived() { func(); }
        void func() { cout << "d"; }
};
What is output of: Derived obj;`, 
    'Bbd');

  add('output', `class Counter {
    static int count;
    public:
        Counter() { count += 2; cout << count; }
        ~Counter() { count -= 1; cout << count; }
};
int Counter::count = 5;
int main() {
    Counter c1;
    {
        Counter c2;
        Counter c3;
    }
    return 0;
}
What is the output?`, '791110986');

  add('design', 'You\'re modeling equipment: Gun, Knife, Grenade. All have use() but different behavior. Best approach?', 
    'Equipment base with virtual use()', 
    ['Three separate classes, no relation', 'Equipment base with virtual use()', 'One class with type enum', 'Multiple inheritance']);

  add('mcq', `class Sample {
    int x;
    public:
        Sample(int a) : x(a) {}
        Sample operator+(int n) { return Sample(x + n); }
};
What happens with: Sample s(5); Sample s2 = 10 + s;`, 
    'Compilation error - no matching operator', 
    ['Runtime error', 'Compilation error - no matching operator', 'Works fine, outputs 15', 'Calls copy constructor']);

  add('output', `class A {
    public:
        virtual void func() { cout << "A"; }
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
    B b;
    A &r1 = b;
    A *p1 = &b;
    r1.func();
    p1->func();
    b.func();
    return 0;
}
What is the output?`, 'BBB');

  add('error', `class Node {
    int *data;
    public:
        Node(int d) : data(new int(d)) {}
        ~Node() { delete data; }
};
int main() {
    Node n1(10);
    Node n2 = n1;
    Node n3(20);
    n3 = n1;
    return 0;
}
What is the error?`, 'Shallow copy causes double/triple deletion and memory leak');

  add('mcq', 'A Server class manages connections. Only one Server instance should exist globally. Which feature is essential?', 
    'Private constructor', 
    ['Copy constructor', 'Virtual destructor', 'Private constructor', 'Public constructor']);

  add('output', `class Test {
    int val;
    public:
        Test(int v) : val(v) { cout << val; }
        Test(const Test &t) : val(t.val + 10) { cout << val; }
        ~Test() { cout << val; }
};
int main() {
    Test t1(5);
    Test t2 = t1;
    Test t3(t2);
    return 0;
}
What is the output?`, '5152525251555');

  add('design', 'Helicopter, Tank, Infantry - all can move(). Best design?', 
    'MilitaryUnit base with virtual move()', 
    ['Global move() function', 'Each separate, no inheritance', 'MilitaryUnit base with virtual move()', 'Multiple inheritance']);

  add('mcq', `class Calculator {
    public:
        int compute(int a, int b) { return a + b; }
        int compute(int a, int b) { return a * b; }
};
What happens?`, 
    'Compilation error - duplicate function', 
    ['Runtime error', 'Second overrides first', 'Compilation error - duplicate function', 'Overloading works fine']);

  add('output', `class Base {
    public:
        void show() { cout << "B"; }
        virtual void display() { cout << "b"; }
        void execute() { show(); display(); }
};
class Derived : public Base {
    public:
        void show() { cout << "D"; }
        void display() { cout << "d"; }
};
int main() {
    Base *b1 = new Base();
    Base *b2 = new Derived();
    b1->execute();
    b2->execute();
    return 0;
}
What is the output?`, 'BbBd');

  add('design', 'You need a Factory class to create different enemy types based on difficulty. Best pattern?', 
    'Factory method - createEnemy(type) returns Enemy*', 
    ['Global functions', 'Factory method - createEnemy(type) returns Enemy*', 'Friend functions', 'Each enemy creates itself']);

  add('mcq', `class A {
    public:
        int x;
        A() { x = 10; }
};
class B : virtual public A {};
class C : virtual public A {};
class D : public B, public C {};
What happens with: D obj; cout << obj.x;`, 
    '10', 
    ['Undefined', '10', '20', 'Compilation error - ambiguous']);

  console.log(`✅ Level 9: ${questions.length} questions prepared`);
  console.log('\n💾 Seeding Level 9 questions to database...');
  await adminService.seedQuestions(questions);
  
  console.log('\n🎉 Level 9 seeding completed!');
  console.log(`📊 Questions seeded: ${questions.length}`);

  await app.close();
}

bootstrap().catch(err => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
