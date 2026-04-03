import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { AdminService } from '../admin/admin.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const adminService = app.get(AdminService);

  console.log('Seeding Level 2 (50 questions — MCQ riddles + oneword)...');

  const questions = [];
  let id = 201;
  const add = (type: string, text: string, answer: string, opts?: string[]) => {
    questions.push({ id: id++, level: 2, roundKey: 'round1', type, text, correct: answer, options: opts || null, isActive: true });
  };

  // ═══════════════════════════════════════════
  // LEVEL 2 — Intermediate OOP Concepts
  // Mix of MCQ riddles + oneword answers
  // Topics: access specifiers, constructors/destructors, overloading vs overriding,
  //         static members, this pointer, basic inheritance, const, structs vs classes
  // ═══════════════════════════════════════════

  // --- Access Specifiers & Encapsulation ---
  add('mcq', 'I am the vault door. By default, every soldier\'s data in a C++ class is locked behind me. Officers must explicitly open access. What am I?', 'C) private', ['A) public', 'B) protected', 'C) private', 'D) static']);
  add('mcq', 'In a C++ struct, what is the default access specifier for its members?', 'A) public', ['A) public', 'B) private', 'C) protected', 'D) static']);
  add('oneword', 'If you want a member accessible inside the class AND its children, but NOT from outside code, you use the ______ specifier. (one word)', 'protected');
  add('mcq', 'A getter function breaks through my defenses legally. It reads a private value without modifying it. What principle does this demonstrate?', 'B) Encapsulation with controlled access', ['A) Polymorphism', 'B) Encapsulation with controlled access', 'C) Inheritance', 'D) Abstraction']);
  add('oneword', 'Making all data members private and exposing only necessary functions is called data ______. (one word)', 'hiding');

  // --- Constructors ---
  add('mcq', 'I am born with no arguments. The compiler gives me to every class for free, until someone writes another constructor. What am I?', 'A) Default Constructor', ['A) Default Constructor', 'B) Copy Constructor', 'C) Parameterized Constructor', 'D) Virtual Constructor']);
  add('mcq', 'I take arguments at birth. Want a soldier with a specific rank and name? Call me. What constructor type am I?', 'C) Parameterized Constructor', ['A) Default Constructor', 'B) Copy Constructor', 'C) Parameterized Constructor', 'D) Friend Constructor']);
  add('mcq', 'I clone an existing soldier. Every detail — rank, weapons, stats — duplicated into a brand new unit. What constructor am I?', 'B) Copy Constructor', ['A) Default Constructor', 'B) Copy Constructor', 'C) Move Constructor', 'D) Assignment Operator']);
  add('oneword', 'When you write MyClass(int x) : val(x) {}, the part after the colon is called the member ______ list. (one word)', 'initialization');
  add('mcq', 'If you define a parameterized constructor in a class, what happens to the default constructor?', 'B) The compiler no longer provides one automatically', ['A) It is still available', 'B) The compiler no longer provides one automatically', 'C) It gets deleted permanently', 'D) It becomes private']);

  // --- Destructors ---
  add('mcq', 'How many destructors can a class have in C++?', 'A) Exactly one', ['A) Exactly one', 'B) As many as needed', 'C) One per base class', 'D) Zero — they are optional']);
  add('oneword', 'The symbol placed before the class name to define a destructor is ______. (one word)', '~');
  add('mcq', 'When does a destructor for a local object get called?', 'C) When the object goes out of scope', ['A) When you call delete', 'B) When main() ends', 'C) When the object goes out of scope', 'D) When you set the object to null']);
  add('mcq', 'Can a destructor take parameters in C++?', 'B) No, never', ['A) Yes, one parameter', 'B) No, never', 'C) Only if virtual', 'D) Only if it is a friend']);

  // --- Overloading vs Overriding ---
  add('mcq', 'Two functions in the SAME class, same name, but different parameter lists. This is called:', 'A) Function Overloading', ['A) Function Overloading', 'B) Function Overriding', 'C) Polymorphism', 'D) Shadowing']);
  add('mcq', 'A derived class defines the SAME function signature as its base class. This is called:', 'B) Function Overriding', ['A) Function Overloading', 'B) Function Overriding', 'C) Function Hiding', 'D) Function Templating']);
  add('oneword', 'When two functions have the same name but different parameters in the SAME class, they are ______. (one word)', 'overloaded');
  add('oneword', 'When a derived class replaces a base class virtual function with the same signature, that is called ______. (one word)', 'overriding');
  add('mcq', 'Function overloading is resolved at which time?', 'A) Compile time', ['A) Compile time', 'B) Run time', 'C) Link time', 'D) Load time']);
  add('mcq', 'Function overriding (with virtual) is resolved at which time?', 'B) Run time', ['A) Compile time', 'B) Run time', 'C) Link time', 'D) Preprocessing time']);

  // --- Static Members ---
  add('mcq', 'I belong to the class, not to any object. All soldiers share me — there is only one copy of me no matter how many troops deploy. What kind of member am I?', 'C) Static member', ['A) Const member', 'B) Virtual member', 'C) Static member', 'D) Friend member']);
  add('oneword', 'A static data member must be defined ______ the class definition in C++. (one word)', 'outside');
  add('mcq', 'Can a static member function access non-static member variables of its class?', 'B) No — it has no this pointer', ['A) Yes, always', 'B) No — it has no this pointer', 'C) Only if the function is virtual', 'D) Only through a friend']);
  add('mcq', 'How do you call a static member function without creating an object?', 'A) ClassName::functionName()', ['A) ClassName::functionName()', 'B) objectName.functionName()', 'C) this->functionName()', 'D) new ClassName()->functionName()']);
  add('oneword', 'A static member function does NOT receive the implicit ______ pointer. (one word)', 'this');

  // --- this Pointer ---
  add('mcq', 'I am an invisible companion to every non-static member function. I point to the object that called the function. What am I?', 'D) this pointer', ['A) base pointer', 'B) self pointer', 'C) null pointer', 'D) this pointer']);
  add('mcq', 'In a setter like void setX(int x) { this->x = x; }, why is "this->" used?', 'C) To distinguish the member variable from the parameter with the same name', ['A) To create a new copy', 'B) To call the base class version', 'C) To distinguish the member variable from the parameter with the same name', 'D) To access a static member']);
  add('oneword', 'The keyword used inside a member function to refer to the calling object itself is ______. (one word)', 'this');

  // --- Inheritance Basics ---
  add('mcq', 'A Sniper IS-A Soldier. The Sniper class inherits from the Soldier class. Which is the base class?', 'B) Soldier', ['A) Sniper', 'B) Soldier', 'C) Both', 'D) Neither']);
  add('mcq', 'In public inheritance, which base class members become accessible in the derived class?', 'C) public and protected members', ['A) Only public members', 'B) Only protected members', 'C) public and protected members', 'D) All members including private']);
  add('oneword', 'When class Dog inherits from class Animal, Dog is called the ______ class. (one word)', 'derived');
  add('mcq', 'Which of the following correctly declares that class Tank publicly inherits from class Vehicle?', 'A) class Tank : public Vehicle { };', ['A) class Tank : public Vehicle { };', 'B) class Tank extends Vehicle { };', 'C) class Tank inherits Vehicle { };', 'D) class Tank -> Vehicle { };']);
  add('oneword', 'In C++, the colon (:) followed by an access specifier and a class name after a class declaration denotes ______. (one word)', 'inheritance');

  // --- Const ---
  add('mcq', 'A const member function promises not to change the object. Which declaration is correct?', 'B) void getVal() const;', ['A) const void getVal();', 'B) void getVal() const;', 'C) void const getVal();', 'D) static void getVal();']);
  add('oneword', 'A variable declared const must be initialized when it is ______. (one word)', 'declared');
  add('mcq', 'Can a const object call a non-const member function?', 'B) No — it can only call const member functions', ['A) Yes, always', 'B) No — it can only call const member functions', 'C) Only if the function is virtual', 'D) Only if the function is static']);

  // --- Struct vs Class ---
  add('mcq', 'In C++, what is the KEY difference between a struct and a class?', 'A) Default access — struct is public, class is private', ['A) Default access — struct is public, class is private', 'B) Structs cannot have functions', 'C) Classes cannot have public members', 'D) Structs do not support inheritance']);
  add('mcq', 'Can a struct in C++ have member functions?', 'A) Yes', ['A) Yes', 'B) No', 'C) Only static functions', 'D) Only constructors']);

  // --- Miscellaneous Concepts ---
  add('mcq', 'What is the scope resolution operator in C++?', 'B) ::', ['A) .', 'B) ::', 'C) ->', 'D) #']);
  add('oneword', 'An inline function request is a ______ to the compiler, not a command. (one word)', 'suggestion');
  add('mcq', 'If class B inherits privately from class A, what happens to A\'s public members in B?', 'C) They become private in B', ['A) They stay public', 'B) They become protected', 'C) They become private in B', 'D) They are deleted']);
  add('mcq', 'I am a special constructor that receives a reference to an object of my own class. I copy all values into a fresh clone. What am I?', 'B) Copy Constructor', ['A) Assignment Operator', 'B) Copy Constructor', 'C) Default Constructor', 'D) Conversion Constructor']);
  add('oneword', 'When class B inherits from class A and class C also inherits from class A, and class D inherits from both B and C, this creates the ______ problem. (one word)', 'diamond');
  add('mcq', 'What keyword solves the diamond inheritance problem in C++?', 'C) virtual', ['A) static', 'B) friend', 'C) virtual', 'D) const']);
  add('oneword', 'A function that is NOT a member of a class but can access its private and protected members, granted by the class using a keyword, is called a ______ function. (one word)', 'friend');
  add('mcq', 'The process of creating an object from a class is called:', 'A) Instantiation', ['A) Instantiation', 'B) Initialization', 'C) Declaration', 'D) Abstraction']);
  add('mcq', 'I carry the traits of my parent class but also define my own unique skills. I am more specialized. What kind of class am I?', 'C) Derived class', ['A) Abstract class', 'B) Base class', 'C) Derived class', 'D) Virtual class']);

  await adminService.seedQuestionsForLevel(2, questions);
  console.log('Level 2 seeded with 50 questions!');
  await app.close();
}

bootstrap().catch(console.error);
