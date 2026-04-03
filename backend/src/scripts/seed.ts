import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { AdminService } from '../admin/admin.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const adminService = app.get(AdminService);

  console.log('Seeding Levels 1-5 (5 questions each)...');

  const level1 = [
    { id: 1, level: 1, roundKey: 'round1', type: 'mcq', text: 'I am the blueprint. Objects are built from me. I define what data they hold and what they can do. What am I?', options: ['A) Object', 'B) Function', 'C) Class', 'D) Module'], correct: 'C) Class', isActive: true },
    { id: 2, level: 1, roundKey: 'round1', type: 'mcq', text: 'I lock my secrets away. Only those with the right key may touch my data. I hide things from the outside world. What OOP concept am I?', options: ['A) Inheritance', 'B) Encapsulation', 'C) Polymorphism', 'D) Abstraction'], correct: 'B) Encapsulation', isActive: true },
    { id: 3, level: 1, roundKey: 'round1', type: 'mcq', text: 'I let a child carry the traits of a parent. A Dog class can carry everything an Animal class has, and add its own tricks. What am I?', options: ['A) Encapsulation', 'B) Abstraction', 'C) Inheritance', 'D) Overloading'], correct: 'C) Inheritance', isActive: true },
    { id: 4, level: 1, roundKey: 'round1', type: 'mcq', text: 'I run automatically the moment an object is born. I set things up, initialize values, prepare the stage. No one explicitly calls me. What am I?', options: ['A) Destructor', 'B) Initializer', 'C) Main function', 'D) Constructor'], correct: 'D) Constructor', isActive: true },
    { id: 5, level: 1, roundKey: 'round1', type: 'mcq', text: 'I run when an object dies. I clean the room, free the memory, and vanish quietly. My name starts with a tilde (~). What am I?', options: ['A) Constructor', 'B) Finalizer', 'C) Destructor', 'D) Delete function'], correct: 'C) Destructor', isActive: true },
  ];

  const level2 = [
    { id: 6, level: 2, roundKey: 'round1', type: 'mcq', text: 'I am the same function called many ways. Add two ints, add two floats — I handle them all with the same name. What concept is this?', options: ['A) Function Overriding', 'B) Function Overloading', 'C) Polymorphism', 'D) Abstraction'], correct: 'B) Function Overloading', isActive: true },
    { id: 7, level: 2, roundKey: 'round1', type: 'oneword', text: 'The access specifier that allows derived classes to access a member, but blocks all outside code, is called ______. (one word)', correct: 'protected', isActive: true },
    { id: 8, level: 2, roundKey: 'round1', type: 'mcq', text: 'I am triggered when you write: Dog d2 = d1; — I create a new object from an existing one. What am I?', options: ['A) Default Constructor', 'B) Parameterized Constructor', 'C) Copy Constructor', 'D) Assignment Operator'], correct: 'C) Copy Constructor', isActive: true },
    { id: 9, level: 2, roundKey: 'round1', type: 'oneword', text: 'Functions with the same name in a base class and derived class where the derived replaces the base version — is called function ______. (one word)', correct: 'overriding', isActive: true },
    { id: 10, level: 2, roundKey: 'round1', type: 'mcq', text: 'I am shared. No matter how many objects are created from my class, all point to the same single copy of me. I belong to the class, not the object. What am I?', options: ['A) Instance Variable', 'B) Local Variable', 'C) Static Member', 'D) Const Variable'], correct: 'C) Static Member', isActive: true },
  ];

  const level3 = [
    { id: 11, level: 3, roundKey: 'round1', type: 'oneword', text: 'I have no body. I exist only as a signature in a base class, forcing every child class to define me. I am a ______ virtual function. (one word)', correct: 'pure', isActive: true },
    { id: 12, level: 3, roundKey: 'round1', type: 'mcq', text: 'I am a class with at least one function that has no body, declared with = 0. You cannot create objects of me directly. What am I?', options: ['A) Concrete Class', 'B) Abstract Class', 'C) Template Class', 'D) Interface Class'], correct: 'B) Abstract Class', isActive: true },
    { id: 13, level: 3, roundKey: 'round1', type: 'oneword', text: 'I am not a member of a class, but I am trusted enough to read its private data. A class grants me access with the "friend" keyword. I am a ______ function. (one word)', correct: 'friend', isActive: true },
    { id: 14, level: 3, roundKey: 'round1', type: 'mcq', text: 'I allow the same operator (+, -, ==) to behave differently for user-defined types. I let you add two Matrix objects using the + sign. What technique am I?', options: ['A) Function Overriding', 'B) Template Specialization', 'C) Operator Overloading', 'D) Friend Access'], correct: 'C) Operator Overloading', isActive: true },
    { id: 15, level: 3, roundKey: 'round1', type: 'oneword', text: 'The implicit pointer inside every non-static member function that points to the current object is named ______. (one word)', correct: 'this', isActive: true },
  ];

  const level4 = [
    { id: 16, level: 4, roundKey: 'round1', type: 'mcq', text: 'What is the output?\n\nclass A {\npublic:\n    A() { cout << "A "; }\n    ~A() { cout << "~A "; }\n};\nclass B : public A {\npublic:\n    B() { cout << "B "; }\n    ~B() { cout << "~B "; }\n};\nint main() { B obj; }', options: ['A) A B ~B ~A', 'B) B A ~A ~B', 'C) A B ~A ~B', 'D) B ~B A ~A'], correct: 'A) A B ~B ~A', isActive: true },
    { id: 17, level: 4, roundKey: 'round1', type: 'mcq', text: 'What is the output?\n\nclass X {\npublic:\n    X() { cout << "X"; }\n    X(const X&) { cout << "Copy"; }\n};\nint main() { X a; X b = a; }', options: ['A) XX', 'B) XCopy', 'C) CopyX', 'D) Copy'], correct: 'B) XCopy', isActive: true },
    { id: 18, level: 4, roundKey: 'round1', type: 'mcq', text: 'What is the output?\n\nclass Counter {\n    static int n;\npublic:\n    Counter() { n++; }\n    static int get() { return n; }\n};\nint Counter::n = 0;\nint main() { Counter a, b, c; cout << Counter::get(); }', options: ['A) 0', 'B) 1', 'C) 2', 'D) 3'], correct: 'D) 3', isActive: true },
    { id: 19, level: 4, roundKey: 'round1', type: 'mcq', text: 'What is the output?\n\nclass Base {\npublic:\n    virtual void show() { cout << "Base"; }\n};\nclass Der : public Base {\npublic:\n    void show() { cout << "Der"; }\n};\nint main() { Base* p = new Der(); p->show(); }', options: ['A) Base', 'B) Der', 'C) BaseDer', 'D) Compiler Error'], correct: 'B) Der', isActive: true },
    { id: 20, level: 4, roundKey: 'round1', type: 'mcq', text: 'What is the output?\n\nclass A {\npublic:\n    void show() { cout << "A"; }\n};\nclass B : public A {\npublic:\n    void show() { cout << "B"; }\n};\nint main() { A* p = new B(); p->show(); }', options: ['A) A', 'B) B', 'C) AB', 'D) Compiler Error'], correct: 'A) A', isActive: true },
  ];

  const level5 = [
    { id: 21, level: 5, roundKey: 'round1', type: 'mcq', text: 'What is WRONG with this code?\n\nclass Animal {\npublic:\n    virtual void speak() = 0;\n};\nint main() { Animal a; a.speak(); }', options: ['A) speak() has no body', 'B) Cannot instantiate an abstract class', 'C) virtual keyword is invalid here', 'D) main() cannot use class objects'], correct: 'B) Cannot instantiate an abstract class', isActive: true },
    { id: 22, level: 5, roundKey: 'round1', type: 'mcq', text: 'What is the bug?\n\nclass Car {\npublic:\n    Car() {}\n    ~Car() { delete engine; }\n    Engine* engine;\n};\nint main() { Car c1; Car c2 = c1; }', options: ['A) Destructor is missing virtual keyword', 'B) Double deletion — no copy constructor (Rule of Three violated)', 'C) engine pointer is public', 'D) ~Car() cannot call delete'], correct: 'B) Double deletion — no copy constructor (Rule of Three violated)', isActive: true },
    { id: 23, level: 5, roundKey: 'round1', type: 'mcq', text: 'Find the syntax error:\n\nclass Shape {\npublic\n    virtual double area() = 0;\n};', options: ['A) area() is missing a body', 'B) Missing colon after "public"', 'C) virtual not allowed on pure functions', 'D) Missing semicolon after closing brace'], correct: 'B) Missing colon after "public"', isActive: true },
    { id: 24, level: 5, roundKey: 'round1', type: 'mcq', text: 'What is wrong here?\n\nclass MyClass {\npublic:\n    void setVal(int x) { x = x; }\n    int x;\n};', options: ['A) x not initialized in constructor', 'B) Assignment x = x assigns parameter to itself, not to the member', 'C) setVal has wrong return type', 'D) x should be private'], correct: 'B) Assignment x = x assigns parameter to itself, not to the member', isActive: true },
    { id: 25, level: 5, roundKey: 'round1', type: 'mcq', text: 'Spot the memory leak:\n\nvoid createObject() {\n    int* p = new int(42);\n    cout << *p;\n}\nint main() { createObject(); }', options: ['A) p should be a reference', 'B) new int(42) is invalid syntax', 'C) Memory allocated with new is never deleted — memory leak', 'D) cout cannot print dereferenced pointer'], correct: 'C) Memory allocated with new is never deleted — memory leak', isActive: true },
  ];

  await adminService.seedQuestionsForLevel(1, level1);
  await adminService.seedQuestionsForLevel(2, level2);
  await adminService.seedQuestionsForLevel(3, level3);
  await adminService.seedQuestionsForLevel(4, level4);
  await adminService.seedQuestionsForLevel(5, level5);
  console.log('Levels 1-5 seeded successfully (5 questions each)');

  await app.close();
}

bootstrap().catch(console.error);
