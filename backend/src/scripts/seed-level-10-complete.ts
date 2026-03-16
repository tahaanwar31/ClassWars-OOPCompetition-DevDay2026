import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { AdminService } from '../admin/admin.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const adminService = app.get(AdminService);

  console.log('🚀 Seeding Level 10 - OPERATION 141 (50 questions)...\n');

  const questions = [];
  const level = 10;
  let questionId = 1001; // Starting from 1001 for Level 10

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

  // Level 10 - All 50 Questions (Operation 141 Theme)
  
  add('complete', `OPERATION 141 SCENARIO:
class Operative {
    protected:
        char *callsign;
    public:
        Operative(const char *c) {
            callsign = new char[strlen(c) + 1];
            strcpy(callsign, c);
        }
        virtual ~Operative() { delete[] callsign; }
};
class Sniper : public Operative {
    int *ammo;
    public:
        Sniper(const char *c, int a) : ________(________), ammo(new int(a)) {}
        ~Sniper() { delete ammo; }
};
Complete the Sniper constructor initialization.`, 'Operative(c)');

  add('output', `class Operative {
    char *callsign;
    public:
        Operative(const char *c) {
            callsign = new char[strlen(c) + 1];
            strcpy(callsign, c);
        }
        ~Operative() { delete[] callsign; cout << "~O"; }
        void show() { cout << callsign; }
};
class Captain : public Operative {
    int *squadSize;
    public:
        Captain(const char *c, int s) : Operative(c), squadSize(new int(s)) {}
        ~Captain() { delete squadSize; cout << "~C"; }
};
int main() {
    Operative *o = new Captain("Price", 4);
    o->show();
    delete o;
    return 0;
}
What is the output?`, 'Price~O');

  add('error', `OPERATION 141:
class Mission {
    int *objectives;
    int count;
    public:
        Mission(int c) : count(c) {
            objectives = new int[count];
        }
        Mission(const Mission &m) {
            count = m.count;
            objectives = m.objectives;
        }
        ~Mission() { delete[] objectives; }
};
int main() {
    Mission m1(5);
    Mission m2 = m1;
    return 0;
}
What is the error?`, 'Shallow copy - double deletion of objectives');

  add('complete', `NATO vs RUSSIA SCENARIO:
class ThreatResponse {
    public:
        virtual void deploy() = 0;
        void execute() {
            brief();
            deploy();
            report();
        }
    ________ :
        void brief() { cout << "Brief"; }
        void report() { cout << "Report"; }
};
What access specifier prevents derived classes from overriding brief() and report()?`, 'private');

  add('mcq', `class Mission {
    public:
        virtual void execute() = 0;
        void launch() { brief(); execute(); report(); }
        virtual void brief() { cout << "Brief"; }
        virtual void report() { cout << "Report"; }
};
class StealthMission : public Mission {
    public:
        void execute() { cout << "Stealth"; }
};
What happens with: Mission *m = new StealthMission(); m->launch();`, 
    'BriefStealthReport', 
    ['Runtime error', 'BriefStealthReport', 'Only "Stealth"', 'Compilation error']);

  add('output', `class Squad {
    static int totalSquads;
    int id;
    public:
        Squad() : id(++totalSquads) { cout << id; }
        Squad(const Squad &s) : id(++totalSquads) { cout << id; }
        ~Squad() { cout << id; --totalSquads; }
};
int Squad::totalSquads = 0;
int main() {
    Squad s1;
    {
        Squad s2 = s1;
        {
            Squad s3 = s2;
        }
    }
    return 0;
}
What is the output?`, '12332211');

  add('error', `HEREFORD BASE SYSTEMS:
class Equipment {
    public:
        virtual void inspect() = 0;
        virtual int getDurability() = 0;
};
class Weapon : public Equipment {
    int durability;
    public:
        Weapon(int d) : durability(d) {}
        void inspect() { cout << "Weapon"; }
};
int main() {
    Weapon w(100);
    return 0;
}
What is the error?`, 'getDurability() not overridden - Weapon still abstract');

  add('error', `class Operative {
    int *health;
    public:
        Operative(int h) : health(new int(h)) {}
        Operative(const Operative &o) : health(new int(*o.health)) {}
        virtual ~Operative() { delete health; }
};
class Sniper : public Operative {
    int *ammo;
    public:
        Sniper(int h, int a) : Operative(h), ammo(new int(a)) {}
        Sniper(const Sniper &s) : Operative(s), ammo(new int(*s.ammo)) {}
};
int main() {
    Operative *arr[2];
    arr[0] = new Sniper(100, 50);
    arr[1] = new Sniper(100, 30);
    delete arr[0];
    delete arr[1];
    return 0;
}
What is the error?`, 'Sniper destructor missing - ammo not deleted, memory leak');

  add('mcq', `COMMAND SYSTEM:
class Commander {
    public:
        void issueOrder() { cout << "C1"; }
        virtual void issueOrder(int priority) { cout << "C2"; }
};
class FieldCommander : public Commander {
    public:
        void issueOrder(int priority) { cout << "FC"; }
};
What happens with: FieldCommander fc; fc.issueOrder();`, 
    'Compilation error - issueOrder() hidden', 
    ['Outputs "C1FC"', 'Compilation error - issueOrder() hidden', 'Outputs "C1"', 'Outputs "FC"']);

  add('complete', `MULTI-THEATER OPERATIONS:
class Theater {
    public:
        virtual void process() = 0;
};
class AirTheater : public Theater {
    public:
        void process() { cout << "Air"; }
};
class LandTheater : public Theater {
    public:
        void process() { cout << "Land"; }
};
int main() {
    Theater *theaters[2];
    theaters[0] = new AirTheater();
    theaters[1] = new LandTheater();
    
    for(int i = 0; i < 2; i++)
        theaters[i]->________();
    
    return 0;
}
What function call enables polymorphic execution?`, 'process');

  add('output', `class Weapon {
    int ammo;
    public:
        Weapon(int a) : ammo(a) { cout << ammo; }
        virtual ~Weapon() { cout << ammo; }
};
class Rifle : public Weapon {
    int scope;
    public:
        Rifle(int a, int s) : Weapon(a), scope(s) { cout << scope; }
        ~Rifle() { cout << scope; }
};
class Sniper : public Rifle {
    int range;
    public:
        Sniper(int a, int s, int r) : Rifle(a, s), range(r) { cout << range; }
        ~Sniper() { cout << range; }
};
int main() {
    Weapon *w = new Sniper(30, 8, 1000);
    delete w;
    return 0;
}
What is the output?`, '3081000~1000~8~30');

  add('error', `SINGLETON COMMS:
class TaskForceComms {
    static TaskForceComms *instance;
    TaskForceComms() {}
    public:
        static TaskForceComms* getInstance() {
            if(instance == NULL)
                instance = new TaskForceComms();
            return instance;
        }
        void broadcast() { cout << "Broadcast"; }
};
int main() {
    TaskForceComms *comms = TaskForceComms::getInstance();
    comms->broadcast();
    return 0;
}
What is the error?`, 'instance not initialized (TaskForceComms* TaskForceComms::instance = NULL; missing)');

  add('design', `class Mission {
    protected:
        int threatLevel;
    public:
        Mission(int t) : threatLevel(t) {}
        virtual void execute() { cout << threatLevel; }
};
class StealthMission : private Mission {
    public:
        StealthMission(int t) : Mission(t) {}
        void deploy() { execute(); }
};
Can you do: StealthMission sm(5); Mission *m = &sm;`, 
    'No - private inheritance prevents conversion');

  add('output', `class Rank {
    int level;
    public:
        Rank(int l = 0) : level(l) { cout << level; }
        Rank(const Rank &r) : level(r.level * 2) { cout << level; }
        ~Rank() { cout << level; }
};
int main() {
    Rank r1(2);
    Rank r2 = r1;
    Rank r3 = r2;
    Rank r4(r3);
    return 0;
}
What is the output?`, '248161616168422');

  add('complete', `POLYMORPHIC THREATS:
class Enemy {
    public:
        ________ void attack() = 0;
};
class Infantry : public Enemy {
    public:
        void attack() { cout << "Infantry"; }
};
class Vehicle : public Enemy {
    public:
        void attack() { cout << "Vehicle"; }
};
int main() {
    Enemy *enemies[2];
    enemies[0] = new Infantry();
    enemies[1] = new Vehicle();
    
    for(int i = 0; i < 2; i++)
        enemies[i]->attack();
    
    return 0;
}
What keyword makes attack() pure virtual?`, 'virtual');

  add('error', `class Squad {
    static int squadCount;
    public:
        Squad() { squadCount++; }
        ~Squad() { squadCount--; }
        static int getCount() { return squadCount; }
};
int main() {
    Squad s1, s2, s3;
    cout << s1.getCount();
    return 0;
}
What is the error?`, 'squadCount not initialized outside class');

  add('mcq', `RESOURCE MANAGEMENT:
class Helicopter {
    int *fuel;
    public:
        Helicopter(int f) : fuel(new int(f)) {}
        ~Helicopter() { delete fuel; }
};
What happens with: Helicopter h1(100); Helicopter h2 = h1; Helicopter h3(50); h3 = h1;`, 
    'Triple deletion of h1\'s fuel', 
    ['Compilation error', 'Memory leak', 'No problem', 'Triple deletion of h1\'s fuel']);

  add('error', `OBJECTIVE TRACKING:
class Objective {
    public:
        virtual void complete() = 0;
};
class EliminateObjective : public Objective {
    public:
        void complete() { cout << "Eliminated"; }
};
class RescueObjective : public Objective {
    public:
        void rescue() { cout << "Rescued"; }
};
int main() {
    RescueObjective ro;
    return 0;
}
What is the error?`, 'complete() not overridden - RescueObjective still abstract');

  add('output', `class Base {
    public:
        virtual void func(int x = 5) { cout << x + x; }
};
class Derived1 : public Base {
    public:
        void func(int x = 10) { cout << x * x; }
};
class Derived2 : public Derived1 {
    public:
        void func(int x = 15) { cout << x - x; }
};
int main() {
    Base *b1 = new Derived1();
    Base *b2 = new Derived2();
    Derived1 *d = new Derived2();
    b1->func();
    b2->func();
    d->func();
    return 0;
}
What is the output?`, '25010');

  add('complete', `LOADOUT MANAGEMENT:
class Weapon {
    public:
        virtual void fire() { cout << "Fire"; }
};
class Loadout {
    Weapon *primary;
    Weapon *secondary;
    public:
        Loadout(Weapon *p, Weapon *s) : primary(p), secondary(s) {}
        ________ { /* Loadout doesn't own weapons */ }
        void attack() {
            primary->fire();
            secondary->fire();
        }
};
Should the destructor delete primary and secondary?`, 'No - aggregation, doesn\'t own');

  add('mcq', `class Soldier {
    int health;
    public:
        Soldier(int h) : health(h) {}
        void heal() const { health += 10; }
};
What's wrong?`, 
    'Cannot modify health in const function', 
    ['health should be public', 'Cannot modify health in const function', 'Missing virtual destructor', 'Nothing']);

  add('output', `class Mission {
    char *codename;
    public:
        Mission(const char *c) {
            codename = new char[strlen(c) + 1];
            strcpy(codename, c);
        }
        Mission(const Mission &m) {
            codename = new char[strlen(m.codename) + 1];
            strcpy(codename, m.codename);
        }
        ~Mission() { delete[] codename; cout << "~"; }
};
int main() {
    Mission m1("Wolverine");
    Mission m2 = m1;
    {
        Mission m3 = m2;
    }
    return 0;
}
What is the output?`, '~~~');

  add('error', `DYNAMIC THREAT RESPONSE:
class Response {
    public:
        virtual void deploy() = 0;
};
class ResponseFactory {
    public:
        Response* createResponse(int level) {
            if(level < 3)
                return new ReconResponse();
            else
                return new AssaultResponse();
        }
};
class ReconResponse : public Response {
    public:
        void deploy() { cout << "Recon"; }
};
class AssaultResponse : public Response {
    public:
        void deploy() { cout << "Assault"; }
};
What's potentially wrong with this factory?`, 'Memory leak - returned pointers never deleted');

  add('error', `class Combatant {
    public:
        virtual void attack() = 0;
        virtual void defend() = 0;
        virtual void retreat() = 0;
};
class Soldier : public Combatant {
    public:
        void attack() { cout << "Attack"; }
        void defend() { cout << "Defend"; }
};
int main() {
    Soldier s;
    return 0;
}
What is the error?`, 'retreat() not overridden - Soldier still abstract');

  add('mcq', `EQUIPMENT SHARING:
class Equipment {
    char *name;
    public:
        Equipment(const char *n) {
            name = new char[strlen(n) + 1];
            strcpy(name, n);
        }
        Equipment(const Equipment &e) : name(e.name) {}
        ~Equipment() { delete[] name; }
};
What problem occurs when copying?`, 
    'Shallow copy - double deletion', 
    ['name becomes NULL', 'Shallow copy - double deletion', 'Memory leak', 'No problem']);

  add('output', `class Operative {
    public:
        Operative() { cout << "O"; }
        virtual ~Operative() { cout << "~O"; }
};
class Sniper : public Operative {
    public:
        Sniper() { cout << "S"; }
        ~Sniper() { cout << "~S"; }
};
class Elite : public Sniper {
    public:
        Elite() { cout << "E"; }
        ~Elite() { cout << "~E"; }
};
int main() {
    Operative *arr[2];
    arr[0] = new Sniper();
    arr[1] = new Elite();
    for(int i = 0; i < 2; i++)
        delete arr[i];
    return 0;
}
What is the output?`, 'OSOSE~S~O~E~S~O');

  add('complete', `COMMAND HIERARCHY:
class Commander {
    public:
        ________ void giveOrder() = 0;
        void execute() {
            giveOrder();
            cout << "Order executed";
        }
};
class General : public Commander {
    public:
        void giveOrder() { cout << "General order: "; }
};
class Captain : public Commander {
    public:
        void giveOrder() { cout << "Captain order: "; }
};
What keyword is needed in Commander::giveOrder()?`, 'virtual');

  add('design', `class Base {
    public:
        Base() { cout << "B"; deploy(); }
        virtual void deploy() { cout << "b"; }
        ~Base() { deploy(); }
};
class Derived : public Base {
    public:
        Derived() { deploy(); }
        void deploy() { cout << "d"; }
        ~Derived() { deploy(); }
};
What is output of: Base *b = new Derived(); delete b;`, 
    'Bbddb');

  add('output', `class Counter {
    static int count;
    int id;
    public:
        Counter() : id(count) { count += 3; cout << id; }
        Counter(int x) : id(x) { count = x + 5; cout << id; }
        ~Counter() { cout << id; }
};
int Counter::count = 10;
int main() {
    Counter c1;
    Counter c2(20);
    Counter c3;
    return 0;
}
What is the output?`, '10202525201010');

  add('mcq', `MISSION LIFECYCLE:
class Mission {
    public:
        virtual void execute() = 0;
        void run() {
            brief();
            execute();
            report();
        }
    private:
        void brief() { cout << "Brief"; }
        void report() { cout << "Report"; }
};
Can derived classes override brief() and report()?`, 
    'No - they are private', 
    ['Only brief()', 'Only report()', 'Yes', 'No - they are private']);

  add('error', `class Vehicle {
    int *fuel;
    public:
        Vehicle(int f) : fuel(new int(f)) {}
        Vehicle(const Vehicle &v) : fuel(new int(*v.fuel)) {}
        ~Vehicle() { delete fuel; }
};
int main() {
    Vehicle v1(100);
    Vehicle v2(50);
    v1 = v2;
    return 0;
}
What is the error?`, 'No assignment operator - v1\'s old fuel leaked, possible double deletion');

  add('output', `class A {
    public:
        virtual void show() { cout << "A"; }
        void process() { show(); cout << "-"; }
};
class B : public A {
    public:
        void show() { cout << "B"; }
};
class C : public B {
    public:
        void show() { cout << "C"; }
};
int main() {
    A *arr[3];
    arr[0] = new A();
    arr[1] = new B();
    arr[2] = new C();
    for(int i = 0; i < 3; i++)
        arr[i]->process();
    return 0;
}
What is the output?`, 'A-B-C-');

  add('complete', `COORDINATED OPERATIONS:
class Squad {
    public:
        virtual void execute() = 0;
};
class AssaultSquad : public Squad {
    public:
        ________ execute() { cout << "Assault"; }
};
class ReconSquad : public Squad {
    public:
        ________ execute() { cout << "Recon"; }
};
What keyword properly overrides execute()?`, 'void');

  add('mcq', `SYSTEMS ARCHITECT:
class System {
    public:
        System() { cout << "Init"; }
        ~System() { cout << "Shutdown"; }
};
class MainSystem {
    System s1, s2;
    public:
        MainSystem() { cout << "Main"; }
        ~MainSystem() { cout << "~Main"; }
};
What is output of: MainSystem ms;`, 
    'InitInitMain~MainShutdownShutdown', 
    ['InitInitMain~MainShutdownShutdown', 'MainInitInit~MainShutdownShutdown', 'InitMainInitInitShutdownMain', 'InitInitMain']);

  add('output', `class Weapon {
    int damage;
    public:
        Weapon(int d = 0) : damage(d) { cout << damage; }
        Weapon(const Weapon &w) : damage(w.damage + w.damage) { cout << damage; }
        ~Weapon() { cout << damage; }
};
int main() {
    Weapon w1(5);
    Weapon w2 = w1;
    Weapon w3 = w2;
    return 0;
}
What is the output?`, '5102020201055');

  add('error', `INVENTORY SYSTEM:
class Equipment {
    static int totalEquipment;
    int id;
    public:
        Equipment() : id(totalEquipment++) {}
        int getID() { return id; }
};
class Weapon : public Equipment {
    public:
        Weapon() {}
};
int main() {
    Weapon w1, w2;
    cout << w1.getID();
    return 0;
}
What is the error?`, 'totalEquipment not initialized outside class');

  add('error', `class Array {
    int *data;
    int size;
    public:
        Array(int s) : size(s), data(new int[s]) {}
        Array(const Array &a) : size(a.size), data(new int[a.size]) {
            for(int i = 0; i < size; i++)
                data[i] = a.data[i];
        }
        ~Array() { delete data; }
};
What is the error?`, 'Should use delete[] data');

  add('mcq', `RESOURCE LIFECYCLE:
class Squad {
    int members;
    public:
        Squad(int m) : members(m) {}
        ~Squad() { cout << "Disbanded"; }
};
What happens with: Squad *s = new Squad(4); delete s;`, 
    'Outputs "Disbanded"', 
    ['No output', 'Compilation error', 'Memory leak', 'Outputs "Disbanded"']);

  add('output', `class Number {
    int val;
    public:
        Number(int v = 0) : val(v) {}
        Number operator+(Number n) { return Number(val + n.val); }
        Number operator*(Number n) { return Number(val * n.val); }
        Number operator-(Number n) { return Number(val - n.val); }
        friend ostream& operator<<(ostream &o, Number n) {
            o << n.val;
            return o;
        }
};
int main() {
    Number n1(8), n2(3), n3(2), n4(5);
    cout << (n1 - n2) * n3 + n4;
    return 0;
}
What is the output?`, '15');

  add('complete', `BRIEFING ROOM:
class BriefingRoom {
    static BriefingRoom *instance;
    ________ BriefingRoom() {}
    public:
        static BriefingRoom* getInstance() {
            if(instance == NULL)
                instance = new BriefingRoom();
            return instance;
        }
};
BriefingRoom* BriefingRoom::instance = NULL;
What access specifier prevents external instantiation?`, 'private');

  add('mcq', `class Operative {
    public:
        void train() { cout << "T1"; }
        virtual void train(int hours) { cout << "T2"; }
};
class Specialist : public Operative {
    public:
        void train(int hours) { cout << "S"; }
};
What happens with: Specialist sp; sp.train();`, 
    'Compilation error', 
    ['Outputs "T1S"', 'Outputs "S"', 'Compilation error', 'Outputs "T1"']);

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
    Test t2(7);
    Test t3 = t1;
    Test t4(9);
    t1 = t4;
    t2 = t3;
    return 0;
}
What is the output?`, 'CP7CCP9==DDDD');

  add('error', `class Mission {
    public:
        virtual int calculatePriority(int threat, int resources) = 0;
};
class HighRisk : public Mission {
    public:
        int calculatePriority(int threat, int resources) { return threat * 2; }
};
class LowRisk : public Mission {
    public:
        double calculatePriority(int threat, int resources) { return threat * 0.5; }
};
What is the error?`, 'LowRisk return type different - doesn\'t override, still abstract');

  add('complete', `OPERATIONAL COMMAND SYSTEM:
class Force {
    public:
        virtual void strike() = 0;
};
class AirForce : public Force {
    public:
        void strike() { cout << "Air strike"; }
};
class LandForce : public Force {
    public:
        void strike() { cout << "Land strike"; }
};
class Commander {
    Force **forces;
    int count;
    public:
        Commander(Force **f, int c) : forces(f), count(c) {}
        void coordinatedStrike() {
            for(int i = 0; i < count; i++)
                forces[i]->________();
        }
};
What function call enables polymorphic strikes?`, 'strike');

  add('output', `class Rank {
    int level;
    public:
        Rank(int l = 0) : level(l) { cout << level; }
        Rank& operator++() { level++; return *this; }
        Rank operator++(int) { Rank r = *this; level++; return r; }
        int get() { return level; }
};
int main() {
    Rank r(3);
    cout << (++r).get();
    cout << (r++).get();
    cout << r.get();
    return 0;
}
What is the output?`, '3445');

  add('error', `FINAL TAKEDOWN:
class SecurityLayer {
    public:
        virtual void breach() = 0;
};
class Firewall : public SecurityLayer {
    public:
        void breach() { cout << "Firewall breached"; }
};
class Encryption : public SecurityLayer {
    public:
        void decrypt() { cout << "Decrypted"; }
};
int main() {
    Encryption e;
    return 0;
}
What is the error?`, 'breach() not overridden - Encryption still abstract');

  add('output', `class Base {
    public:
        void func() { cout << "B"; }
        virtual void display() { cout << "b"; }
        void execute() { func(); display(); }
};
class Derived : public Base {
    public:
        void func() { cout << "D"; }
        void display() { cout << "d"; }
};
int main() {
    Base b;
    Derived d;
    Base *p1 = &b;
    Base *p2 = &d;
    p1->execute();
    p2->execute();
    return 0;
}
What is the output?`, 'BbBd');

  add('error', `class Calculator {
    public:
        int add(int a, int b) { return a + b; }
        int add(int a, int b, int c = 0) { return a + b + c; }
};
What is the error?`, 'Ambiguous overload - add(int, int) matches both');

  add('complete', `SYSTEMS ARCHITECT FINAL CHALLENGE:
class Operative {
    public:
        ________ void execute() = 0;
};
class Mission {
    Operative **team;
    int size;
    public:
        Mission(Operative **t, int s) : team(t), size(s) {}
        void deploy() {
            for(int i = 0; i < size; i++)
                team[i]->execute();
        }
};
What keyword makes execute() polymorphic?`, 'virtual');

  add('output', `class TF141 {
    static int operatives;
    int id;
    public:
        TF141() : id(++operatives) { cout << id; }
        TF141(const TF141 &t) : id(++operatives) { cout << id; }
        ~TF141() { cout << id; operatives--; }
};
int TF141::operatives = 140;
int main() {
    TF141 t1;
    {
        TF141 t2 = t1;
        {
            TF141 t3 = t2;
        }
    }
    cout << " MISSION COMPLETE";
    return 0;
}
What is the output?`, '141142143143142141 MISSION COMPLETE');

  console.log(`✅ Level 10: ${questions.length} questions prepared`);
  console.log('\n💾 Seeding Level 10 questions to database...');
  await adminService.seedQuestions(questions);
  
  console.log('\n🎉 Level 10 - OPERATION 141 seeding completed!');
  console.log(`📊 Questions seeded: ${questions.length}`);

  await app.close();
}

bootstrap().catch(err => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
