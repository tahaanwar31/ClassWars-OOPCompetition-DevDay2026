import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { AdminService } from '../admin/admin.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const adminService = app.get(AdminService);

  const questions: any[] = [];
  const level = 1;
  let questionId = 101;

  const add = (type: string, text: string, answer: string, opts?: string[]) => {
    questions.push({ id: questionId++, level, roundKey: 'round1', type, text, correct: answer, options: opts || null, isActive: true });
  };

  // LEVEL 1 — Foundational OOP Concepts
  // Topics: Classes, Objects, Encapsulation, Inheritance, Polymorphism,
  //         Abstraction, Constructors, Destructors — riddle-style MCQs
  // Difficulty: Beginner — simple definitions and concept identification

  // --- Classes & Objects ---
  add('mcq', 'I am the blueprint. Objects are built from me. I define what data they hold and what they can do. What am I?', 'C) Class', ['A) Object', 'B) Function', 'C) Class', 'D) Module']);
  add('mcq', 'I am born from a class. I live in memory. I carry data and can perform actions. What am I?', 'B) Object', ['A) Class', 'B) Object', 'C) Variable', 'D) Pointer']);
  add('mcq', 'In C++, what keyword is used to define a class?', 'A) class', ['A) class', 'B) struct', 'C) define', 'D) object']);
  add('mcq', 'A class contains both data and functions. The data members are also called:', 'B) Attributes / Properties', ['A) Methods', 'B) Attributes / Properties', 'C) Constructors', 'D) Modules']);
  add('mcq', 'The functions defined inside a class are called:', 'C) Member functions / Methods', ['A) Variables', 'B) Constructors', 'C) Member functions / Methods', 'D) Pointers']);
  add('mcq', 'Which of the following correctly creates an object of class Car?', 'A) Car myCar;', ['A) Car myCar;', 'B) new Car myCar;', 'C) object Car myCar;', 'D) create Car();']);
  add('mcq', 'How many objects can you create from a single class?', 'D) As many as you want', ['A) Only one', 'B) Exactly two', 'C) Up to ten', 'D) As many as you want']);
  add('mcq', 'A class definition ends with:', 'B) A semicolon (;)', ['A) A closing bracket only }', 'B) A semicolon (;)', 'C) The return keyword', 'D) The end keyword']);

  // --- Encapsulation ---
  add('mcq', 'I lock my secrets away. Only those with the right key may touch my data. I hide things from the outside world. What OOP concept am I?', 'B) Encapsulation', ['A) Inheritance', 'B) Encapsulation', 'C) Polymorphism', 'D) Abstraction']);
  add('mcq', 'Bundling data and the functions that operate on that data into a single unit is called:', 'A) Encapsulation', ['A) Encapsulation', 'B) Abstraction', 'C) Polymorphism', 'D) Composition']);
  add('mcq', 'Which access specifier hides data from everyone outside the class?', 'B) private', ['A) public', 'B) private', 'C) protected', 'D) friend']);
  add('mcq', 'Which access specifier allows anyone to access the member?', 'A) public', ['A) public', 'B) private', 'C) protected', 'D) static']);
  add('mcq', 'In C++, the default access specifier for class members is:', 'B) private', ['A) public', 'B) private', 'C) protected', 'D) static']);
  add('mcq', 'Functions that allow controlled access to private data are called:', 'C) Getters and Setters', ['A) Constructors', 'B) Destructors', 'C) Getters and Setters', 'D) Operators']);

  // --- Inheritance ---
  add('mcq', 'I let a child carry the traits of a parent. A Dog class can carry everything an Animal class has, and add its own tricks. What am I?', 'C) Inheritance', ['A) Encapsulation', 'B) Abstraction', 'C) Inheritance', 'D) Overloading']);
  add('mcq', 'The class that is inherited FROM is called the:', 'A) Base class / Parent class', ['A) Base class / Parent class', 'B) Derived class / Child class', 'C) Friend class', 'D) Abstract class']);
  add('mcq', 'The class that inherits from another class is called the:', 'B) Derived class / Child class', ['A) Base class', 'B) Derived class / Child class', 'C) Static class', 'D) Template class']);
  add('mcq', 'What symbol is used in C++ to indicate inheritance?', 'C) : (colon)', ['A) -> (arrow)', 'B) . (dot)', 'C) : (colon)', 'D) :: (scope resolution)']);
  add('mcq', 'If class Dog inherits from class Animal, Dog can use:', 'B) All public and protected members of Animal', ['A) Only public members of Animal', 'B) All public and protected members of Animal', 'C) All members including private', 'D) No members of Animal']);
  add('mcq', 'Inheritance promotes:', 'A) Code reusability', ['A) Code reusability', 'B) Code duplication', 'C) Data hiding', 'D) Memory management']);

  // --- Polymorphism ---
  add('mcq', 'I wear many faces. The same function name can behave differently depending on the object calling it. What OOP concept am I?', 'C) Polymorphism', ['A) Encapsulation', 'B) Inheritance', 'C) Polymorphism', 'D) Abstraction']);
  add('mcq', 'The word "polymorphism" literally means:', 'B) Many forms', ['A) One form', 'B) Many forms', 'C) No form', 'D) Hidden form']);
  add('mcq', 'Which of the following is an example of polymorphism?', 'C) A function called draw() behaving differently for Circle and Square', ['A) A class having private members', 'B) A child class having a parent', 'C) A function called draw() behaving differently for Circle and Square', 'D) A variable being declared static']);
  add('mcq', 'Having two functions with the same name but different parameters in the same class is called:', 'A) Function Overloading', ['A) Function Overloading', 'B) Function Overriding', 'C) Encapsulation', 'D) Abstraction']);
  add('mcq', 'When a derived class provides its own version of a base class function, this is called:', 'B) Function Overriding', ['A) Function Overloading', 'B) Function Overriding', 'C) Encapsulation', 'D) Composition']);

  // --- Abstraction ---
  add('mcq', 'I show you the steering wheel and pedals, but hide the engine internals. I expose the WHAT but not the HOW. What OOP concept am I?', 'D) Abstraction', ['A) Encapsulation', 'B) Polymorphism', 'C) Inheritance', 'D) Abstraction']);
  add('mcq', 'Abstraction focuses on:', 'B) Showing essential features and hiding implementation details', ['A) Bundling data and functions', 'B) Showing essential features and hiding implementation details', 'C) Inheriting from parent classes', 'D) Overloading operators']);
  add('mcq', 'Which of the following is the best example of abstraction?', 'C) Using cout << without knowing how the screen output works internally', ['A) Making all members public', 'B) Creating multiple objects', 'C) Using cout << without knowing how the screen output works internally', 'D) Deleting a pointer']);

  // --- Constructors ---
  add('mcq', 'I run automatically the moment an object is born. I set things up, initialize values, prepare the stage. No one explicitly calls me. What am I?', 'D) Constructor', ['A) Destructor', 'B) Initializer', 'C) Main function', 'D) Constructor']);
  add('mcq', 'A constructor has the same name as the:', 'A) Class', ['A) Class', 'B) Object', 'C) File', 'D) Namespace']);
  add('mcq', 'What is the return type of a constructor?', 'D) It has no return type — not even void', ['A) void', 'B) int', 'C) The class type', 'D) It has no return type — not even void']);
  add('mcq', 'A constructor that takes no arguments is called a:', 'A) Default constructor', ['A) Default constructor', 'B) Copy constructor', 'C) Parameterized constructor', 'D) Virtual constructor']);
  add('mcq', 'A constructor that takes arguments to initialize members with specific values is called a:', 'B) Parameterized constructor', ['A) Default constructor', 'B) Parameterized constructor', 'C) Copy constructor', 'D) Static constructor']);
  add('mcq', 'Can a class have more than one constructor?', 'A) Yes — this is constructor overloading', ['A) Yes — this is constructor overloading', 'B) No — only one is allowed', 'C) Only if the class is abstract', 'D) Only with the virtual keyword']);
  add('mcq', 'If you do not write any constructor, the compiler provides a:', 'C) Default constructor automatically', ['A) Nothing — compilation fails', 'B) Copy constructor only', 'C) Default constructor automatically', 'D) Parameterized constructor']);

  // --- Destructors ---
  add('mcq', 'I run when an object dies. I clean the room, free the memory, and vanish quietly. My name starts with a tilde (~). What am I?', 'C) Destructor', ['A) Constructor', 'B) Finalizer', 'C) Destructor', 'D) Delete function']);
  add('mcq', 'A destructor is named with a tilde (~) followed by the:', 'B) Class name', ['A) Object name', 'B) Class name', 'C) Function name', 'D) File name']);
  add('mcq', 'How many destructors can a class have?', 'A) Exactly one', ['A) Exactly one', 'B) As many as constructors', 'C) Two — one default and one custom', 'D) Zero']);
  add('mcq', 'Can a destructor take parameters?', 'B) No — destructors take no parameters', ['A) Yes — like constructors', 'B) No — destructors take no parameters', 'C) Only one parameter', 'D) Only if virtual']);
  add('mcq', 'When is a destructor called for a local object?', 'C) When the object goes out of scope', ['A) When you call delete', 'B) At the start of the program', 'C) When the object goes out of scope', 'D) Never — it must be called manually']);

  // --- General OOP Concepts ---
  add('mcq', 'Which of the following are the four pillars of OOP?', 'A) Encapsulation, Inheritance, Polymorphism, Abstraction', ['A) Encapsulation, Inheritance, Polymorphism, Abstraction', 'B) Classes, Objects, Functions, Variables', 'C) Public, Private, Protected, Static', 'D) Constructor, Destructor, Friend, Virtual']);
  add('mcq', 'OOP stands for:', 'B) Object-Oriented Programming', ['A) Object-Ordered Processing', 'B) Object-Oriented Programming', 'C) Operator-Oriented Programming', 'D) Output-Oriented Processing']);
  add('mcq', 'In C++, a struct is similar to a class, but its default access specifier is:', 'A) public', ['A) public', 'B) private', 'C) protected', 'D) friend']);
  add('mcq', 'Which of the following is NOT an OOP concept?', 'D) Compilation', ['A) Inheritance', 'B) Polymorphism', 'C) Encapsulation', 'D) Compilation']);
  add('mcq', 'An object is also called a(n) ______ of a class:', 'B) Instance', ['A) Blueprint', 'B) Instance', 'C) Template', 'D) Module']);
  add('mcq', 'Which keyword is used to dynamically allocate an object in C++?', 'C) new', ['A) create', 'B) malloc', 'C) new', 'D) alloc']);
  add('mcq', 'Which keyword is used to free a dynamically allocated object in C++?', 'B) delete', ['A) free', 'B) delete', 'C) remove', 'D) destroy']);
  add('mcq', 'Data members of a class are usually declared as ______ to enforce encapsulation:', 'B) private', ['A) public', 'B) private', 'C) protected', 'D) static']);
  add('mcq', 'The dot operator (.) is used to:', 'A) Access members of an object', ['A) Access members of an object', 'B) Define a class', 'C) Declare a pointer', 'D) Inherit from a class']);
  add('mcq', 'The arrow operator (->) is used to access members through a:', 'B) Pointer to an object', ['A) Reference to an object', 'B) Pointer to an object', 'C) Class name', 'D) Namespace']);

  await adminService.seedQuestionsForLevel(level, questions);
  console.log('Level 1 seeded with 50 foundational OOP questions!');
  await app.close();
}

bootstrap().catch(console.error);
