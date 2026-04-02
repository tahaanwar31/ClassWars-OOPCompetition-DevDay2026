import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { AdminService } from '../admin/admin.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const adminService = app.get(AdminService);

  console.log('Seeding Level 1 (50 riddle questions)...');

  const questions = [];
  let id = 101;
  const add = (type: string, text: string, answer: string, opts?: string[]) => {
    questions.push({ id: id++, level: 1, roundKey: 'round1', type, text, correct: answer, options: opts || null, isActive: true });
  };

  // ═══════════════════════════════════════════
  // LEVEL 1 — OOP Riddles (MCQ + oneword mix)
  // Fun, accessible, themed as army briefings
  // ═══════════════════════════════════════════

  add('mcq', 'I am the blueprint. Builders read me to construct soldiers. I describe their weapons, rank, and skills — but I am not a soldier myself. What am I in OOP?', 'C) Class', ['A) Object', 'B) Function', 'C) Class', 'D) Interface']);
  add('mcq', 'I am a real soldier, created from the blueprint. I have my own armor and my own name. What am I?', 'B) Object', ['A) Class', 'B) Object', 'C) Method', 'D) Variable']);
  add('mcq', 'I hide the radio frequency of the base. Only the general can call in. I keep secrets from outsiders. What OOP concept am I?', 'A) Encapsulation', ['A) Encapsulation', 'B) Inheritance', 'C) Polymorphism', 'D) Overriding']);
  add('mcq', 'Junior soldiers inherit the skills of their senior. A Sniper IS-A Soldier and gets everything automatically. What concept is this?', 'C) Inheritance', ['A) Encapsulation', 'B) Abstraction', 'C) Inheritance', 'D) Composition']);
  add('mcq', 'The command "Fire!" means different things to a sniper, a rocket trooper, and an artillery unit. Same command, different result. What OOP concept is this?', 'B) Polymorphism', ['A) Inheritance', 'B) Polymorphism', 'C) Encapsulation', 'D) Overloading']);
  add('mcq', 'The mission brief says "Deploy a unit" but does not say how. Each team implements it their own way. The interface only lists the mission — no details. What concept?', 'D) Abstraction', ['A) Encapsulation', 'B) Polymorphism', 'C) Inheritance', 'D) Abstraction']);
  add('mcq', 'I am called the moment a soldier is created. I assign gear, rank, and a name right at birth. What am I?', 'A) Constructor', ['A) Constructor', 'B) Destructor', 'C) Method', 'D) Initializer']);
  add('mcq', 'I run when the soldier is dismissed. I clean up the gear locker, return equipment, free up memory. My name begins with ~. What am I?', 'B) Destructor', ['A) Constructor', 'B) Destructor', 'C) Finalizer', 'D) Deleter']);
  add('mcq', 'I let outsiders access a soldiers rank without changing it directly. I am a member function that only returns a value. What type of function am I?', 'C) Getter', ['A) Setter', 'B) Modifier', 'C) Getter', 'D) Friend']);
  add('mcq', 'I let a commander update a soldiers rank from outside the class. What type of function am I?', 'A) Setter', ['A) Setter', 'B) Getter', 'C) Constructor', 'D) Override']);

  add('oneword', 'A variable or function that belongs to the class itself, not to any specific object, is called a ______ member. (one word)', 'static');
  add('oneword', 'The keyword in C++ that prevents a variable from being changed after it is initialized is ______. (one word)', 'const');
  add('oneword', 'The access specifier that allows only the class itself and its derived classes to use a member is ______. (one word)', 'protected');
  add('mcq', 'Which access specifier in C++ makes a member accessible from ANYWHERE in the program?', 'B) public', ['A) private', 'B) public', 'C) protected', 'D) friend']);
  add('mcq', 'Which access specifier is the DEFAULT for class members in C++?', 'A) private', ['A) private', 'B) public', 'C) protected', 'D) static']);

  add('mcq', 'I am a function defined inside a class. I describe an action the object can perform — like aim(), fire(), or retreat(). What am I?', 'C) Member function', ['A) Global function', 'B) Free function', 'C) Member function', 'D) Static function']);
  add('oneword', 'The mechanism by which a derived class inherits from more than one base class is called ______ inheritance. (one word)', 'multiple');
  add('mcq', 'The "IS-A" relationship maps to which OOP concept?', 'A) Inheritance', ['A) Inheritance', 'B) Composition', 'C) Aggregation', 'D) Association']);
  add('mcq', 'The "HAS-A" relationship, where a class contains an object of another class, maps to which concept?', 'B) Composition', ['A) Inheritance', 'B) Composition', 'C) Polymorphism', 'D) Abstraction']);
  add('oneword', 'The keyword used in C++ to create a new object on the heap is ______. (one word)', 'new');

  add('mcq', 'What is a CLASS in C++ most accurately described as?', 'D) A user-defined data type with data and functions', ['A) A built-in type like int or float', 'B) A module containing only functions', 'C) A variable that stores values', 'D) A user-defined data type with data and functions']);
  add('mcq', 'Which feature of OOP helps reduce code duplication by letting you reuse a parent class implementation?', 'B) Inheritance', ['A) Encapsulation', 'B) Inheritance', 'C) Overloading', 'D) Abstraction']);
  add('oneword', 'An object is a specific ______ of a class. (one word)', 'instance');
  add('mcq', 'How do you define a member function OUTSIDE the class definition in C++?', 'C) ClassName::functionName()', ['A) functionName::ClassName()', 'B) ClassName.functionName()', 'C) ClassName::functionName()', 'D) functionName(ClassName)']);
  add('oneword', 'The implicit parameter passed to every non-static member function referring to the calling object is called ______. (one word)', 'this');

  add('mcq', 'Which of the following BEST describes polymorphism?', 'A) The same function behaving differently based on the object calling it', ['A) The same function behaving differently based on the object calling it', 'B) A child class copying its parent', 'C) A class hiding its data members', 'D) A function with no return type']);
  add('mcq', 'A class Dog inherits from Animal. Dog has method speak() that overrides Animal speak(). When we call animal->speak() where animal points to a Dog, which speak() runs?', 'B) Dog speak() — if speak() is virtual', ['A) Animal speak() always', 'B) Dog speak() — if speak() is virtual', 'C) Both run together', 'D) Compiler error']);
  add('oneword', 'The C++ keyword placed before a base class member function to allow runtime polymorphism is ______. (one word)', 'virtual');
  add('mcq', 'Which of the following is NOT a pillar of OOP?', 'D) Compilation', ['A) Inheritance', 'B) Encapsulation', 'C) Polymorphism', 'D) Compilation']);
  add('mcq', 'What happens if you do NOT define a constructor in a C++ class?', 'A) A default constructor is automatically provided by the compiler', ['A) A default constructor is automatically provided by the compiler', 'B) The class cannot be instantiated', 'C) A compile error occurs', 'D) The object is initialized to null']);

  add('mcq', 'I am the soldier\'s rank field — nobody outside the platoon can see or change me. What access specifier am I?', 'C) private', ['A) public', 'B) protected', 'C) private', 'D) const']);
  add('oneword', 'A constructor that takes no arguments is called a ______ constructor. (one word)', 'default');
  add('oneword', 'A constructor that takes arguments to initialize an object is called a ______ constructor. (one word)', 'parameterized');
  add('mcq', 'An object created with "new" is stored in which area of memory?', 'B) Heap', ['A) Stack', 'B) Heap', 'C) Code segment', 'D) Register']);
  add('mcq', 'An object declared as a local variable inside a function is stored where?', 'A) Stack', ['A) Stack', 'B) Heap', 'C) Global memory', 'D) Register']);

  add('oneword', 'When a derived class provides its own version of a virtual base class function, that is called function ______. (one word)', 'overriding');
  add('mcq', 'Function OVERLOADING and function OVERRIDING are different. Which one involves the SAME class defining the same function name with different parameters?', 'A) Overloading', ['A) Overloading', 'B) Overriding', 'C) Both the same', 'D) Neither']);
  add('mcq', 'I am a member function that shares the name of my class and has no return type. When I am called with parameters, I set up the object. What am I?', 'B) Parameterized constructor', ['A) Default constructor', 'B) Parameterized constructor', 'C) Copy constructor', 'D) Destructor']);
  add('mcq', 'Which function is called when one object is created from another existing object using: Soldier s2 = s1?', 'C) Copy constructor', ['A) Default constructor', 'B) Assignment operator', 'C) Copy constructor', 'D) Overloaded constructor']);
  add('oneword', 'The operator used in C++ to access a member of an object through a pointer is ______. (one word)', '->');

  add('mcq', 'What does "data hiding" mean in OOP?', 'B) Restricting access to the internal state of an object', ['A) Deleting data from memory', 'B) Restricting access to the internal state of an object', 'C) Making data constants', 'D) Hiding data in a file']);
  add('oneword', 'The concept that allows you to interact with an object without knowing how it works internally is called ______. (one word)', 'abstraction');
  add('mcq', 'A class defined within another class is called a _____ class.', 'C) Nested', ['A) Inner C++ class', 'B) Friend class', 'C) Nested class', 'D) Child class']);
  add('mcq', 'Which statement creates a Dog object called rex from the Dog class?', 'A) Dog rex;', ['A) Dog rex;', 'B) rex = new Dog;', 'C) Create Dog rex;', 'D) object Dog rex;']);
  add('oneword', 'A C++ class member function that does NOT modify the object state should be declared with the ______ keyword. (one word)', 'const');

  add('mcq', 'Which of the following is TRUE about destructors in C++?', 'D) A class can have only one destructor', ['A) A class can have multiple destructors', 'B) A destructor can take parameters', 'C) A destructor can return a value', 'D) A class can have only one destructor']);
  add('mcq', 'If class B inherits from class A, B is called the ______ class.', 'B) Derived', ['A) Base', 'B) Derived', 'C) Abstract', 'D) Concrete']);
  add('oneword', 'The class that is inherited FROM is called the ______ class. (one word)', 'base');
  add('mcq', 'What is the output of this simple code?\n\nclass Warrior {\npublic:\n    Warrior() { cout << "Ready!"; }\n};\nint main() { Warrior w; }', 'A) Ready!', ['A) Ready!', 'B) Nothing', 'C) Warrior', 'D) Compiler error']);
  add('mcq', 'Which keyword is used in C++ to specify that a class inherits from another class?', 'C) : public', ['A) extends', 'B) inherits', 'C) : public', 'D) -> parent']);

  await adminService.seedQuestionsForLevel(1, questions);
  console.log('Level 1 seeded with 50 riddle questions!');
  await app.close();
}

bootstrap().catch(console.error);
