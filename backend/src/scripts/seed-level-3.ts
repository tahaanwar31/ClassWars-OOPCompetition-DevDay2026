import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { AdminService } from '../admin/admin.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const adminService = app.get(AdminService);

  console.log('Seeding Level 3 (50 questions — harder conceptual)...');

  const questions = [];
  let id = 301;
  const add = (type: string, text: string, answer: string, opts?: string[]) => {
    questions.push({ id: id++, level: 3, roundKey: 'round1', type, text, correct: answer, options: opts || null, isActive: true });
  };

  // ═══════════════════════════════════════════
  // LEVEL 3 — Harder Conceptual OOP
  // Topics: friend functions/classes, operator overloading, virtual functions,
  //         pure virtual, abstract classes, multiple/diamond inheritance,
  //         composition vs inheritance, deeper constructor/destructor order
  // ═══════════════════════════════════════════

  // --- Friend Functions & Classes ---
  add('mcq', 'I am not part of your platoon, but the commander trusts me with classified intel. I can access private members without being a member function. What am I?', 'B) Friend function', ['A) Static function', 'B) Friend function', 'C) Virtual function', 'D) Inline function']);
  add('mcq', 'When Class A declares Class B as a friend, what can Class B access?', 'D) All members of A — private, protected, and public', ['A) Only public members of A', 'B) Only protected members of A', 'C) Only static members of A', 'D) All members of A — private, protected, and public']);
  add('oneword', 'If class A declares "friend class B;", the friendship is ______-directional — B can access A, but NOT the other way around. (one word)', 'one');
  add('mcq', 'Is friendship inherited in C++? If A is a friend of B, and C derives from B, can A access C\'s private members?', 'B) No — friendship is not inherited', ['A) Yes, automatically', 'B) No — friendship is not inherited', 'C) Only if C is abstract', 'D) Only with virtual inheritance']);
  add('oneword', 'A friend function is declared inside the class using the ______ keyword. (one word)', 'friend');

  // --- Operator Overloading ---
  add('mcq', 'I let two soldiers be added together using the + sign. Without me, the compiler would reject it for user-defined types. What technique am I?', 'C) Operator Overloading', ['A) Function Overriding', 'B) Function Overloading', 'C) Operator Overloading', 'D) Type Casting']);
  add('oneword', 'The keyword used in C++ to overload an operator is ______. (one word)', 'operator');
  add('mcq', 'Which of these operators CANNOT be overloaded in C++?', 'D) :: (scope resolution)', ['A) + (addition)', 'B) << (stream insertion)', 'C) == (equality)', 'D) :: (scope resolution)']);
  add('mcq', 'When overloading the + operator as a member function, how many explicit parameters does it take?', 'A) One — the right operand (left is "this")', ['A) One — the right operand (left is "this")', 'B) Two — both operands', 'C) None — both are implicit', 'D) Three — left, right, and result']);
  add('mcq', 'Which operator is usually overloaded as a friend function rather than a member function?', 'B) << (stream insertion)', ['A) + (addition)', 'B) << (stream insertion)', 'C) = (assignment)', 'D) [] (subscript)']);
  add('mcq', 'Can the assignment operator (=) be overloaded in C++?', 'A) Yes — and it should be when the class has dynamic memory', ['A) Yes — and it should be when the class has dynamic memory', 'B) No — it is always built-in', 'C) Only as a friend', 'D) Only outside the class']);

  // --- Virtual Functions ---
  add('mcq', 'The general gives the command "Report!" — a Sniper reports distance, a Medic reports injuries. Same command, different behavior. This requires which keyword on the base function?', 'A) virtual', ['A) virtual', 'B) static', 'C) friend', 'D) const']);
  add('mcq', 'Without the virtual keyword, calling a function through a base class pointer will always invoke which version?', 'A) The base class version', ['A) The base class version', 'B) The derived class version', 'C) Both versions', 'D) Neither — it causes an error']);
  add('oneword', 'A virtual function is dispatched based on the actual object type at ______ time. (one word)', 'run');
  add('mcq', 'What is a vtable in C++?', 'B) A table of function pointers used for dynamic dispatch of virtual functions', ['A) A table of variable types', 'B) A table of function pointers used for dynamic dispatch of virtual functions', 'C) A table of template instantiations', 'D) A table of class names']);
  add('mcq', 'Should base class destructors be declared virtual when using polymorphism?', 'A) Yes — to ensure derived destructors are called during deletion through a base pointer', ['A) Yes — to ensure derived destructors are called during deletion through a base pointer', 'B) No — destructors are always virtual', 'C) Only if the class is abstract', 'D) Only in multiple inheritance']);

  // --- Pure Virtual & Abstract Classes ---
  add('mcq', 'I have no body. I am declared with "= 0" at the end. Every child class MUST implement me or remain abstract itself. What am I?', 'D) Pure virtual function', ['A) Virtual function', 'B) Static function', 'C) Friend function', 'D) Pure virtual function']);
  add('oneword', 'A class that contains at least one pure virtual function is called an ______ class. (one word)', 'abstract');
  add('mcq', 'Can you create an object of an abstract class in C++?', 'B) No — you can only use pointers or references to it', ['A) Yes, always', 'B) No — you can only use pointers or references to it', 'C) Only with the new keyword', 'D) Only if all pure virtual functions have default implementations']);
  add('mcq', 'If class Animal has a pure virtual function speak(), and class Dog inherits from Animal but does NOT implement speak(), what happens?', 'C) Dog also becomes abstract — you cannot instantiate it', ['A) Dog uses Animal\'s speak()', 'B) Compiler provides a default speak()', 'C) Dog also becomes abstract — you cannot instantiate it', 'D) Runtime error']);
  add('oneword', 'The syntax to declare a pure virtual function in C++ ends with = ______. (one word)', '0');

  // --- Inheritance Types ---
  add('mcq', 'In public inheritance, a public member of the base class becomes ______ in the derived class.', 'A) public', ['A) public', 'B) private', 'C) protected', 'D) inaccessible']);
  add('mcq', 'In protected inheritance, a public member of the base class becomes ______ in the derived class.', 'B) protected', ['A) public', 'B) protected', 'C) private', 'D) deleted']);
  add('mcq', 'In private inheritance, ALL inherited members of the base class become ______ in the derived class.', 'C) private', ['A) public', 'B) protected', 'C) private', 'D) inaccessible']);
  add('oneword', 'The type of inheritance where a class inherits from more than one base class is called ______ inheritance. (one word)', 'multiple');
  add('mcq', 'Class A → Class B → Class C form a chain. What type of inheritance is this?', 'B) Multilevel inheritance', ['A) Multiple inheritance', 'B) Multilevel inheritance', 'C) Hierarchical inheritance', 'D) Hybrid inheritance']);
  add('mcq', 'Multiple classes (Dog, Cat, Fish) all inherit from the same single class Animal. What type of inheritance is this?', 'C) Hierarchical inheritance', ['A) Multiple inheritance', 'B) Multilevel inheritance', 'C) Hierarchical inheritance', 'D) Single inheritance']);

  // --- Diamond Inheritance ---
  add('mcq', 'Class D inherits from both B and C, and both B and C inherit from A. D gets TWO copies of A\'s members. What is this problem called?', 'A) The diamond problem', ['A) The diamond problem', 'B) The circular dependency', 'C) The deadlock problem', 'D) The ambiguity trap']);
  add('oneword', 'The solution to the diamond problem in C++ is to use ______ inheritance. (one word)', 'virtual');
  add('mcq', 'In virtual inheritance, how many copies of the grandparent class does the most-derived class get?', 'A) Exactly one', ['A) Exactly one', 'B) Two', 'C) One per intermediate class', 'D) Zero']);

  // --- Composition vs Inheritance ---
  add('mcq', 'A Tank HAS-A Engine. The Engine object lives inside the Tank class as a member. What is this relationship called?', 'B) Composition', ['A) Inheritance', 'B) Composition', 'C) Aggregation', 'D) Friendship']);
  add('mcq', 'A Sniper IS-A Soldier. This relationship is best modeled by:', 'A) Inheritance', ['A) Inheritance', 'B) Composition', 'C) Friend class', 'D) Static membership']);
  add('oneword', 'When an object contains another object as a member, and the contained object cannot exist without the container, this is called ______. (one word)', 'composition');

  // --- Constructor/Destructor Order ---
  add('mcq', 'When creating a derived class object, which constructor runs FIRST?', 'A) The base class constructor', ['A) The base class constructor', 'B) The derived class constructor', 'C) Both run simultaneously', 'D) Whichever is declared first']);
  add('mcq', 'When destroying a derived class object, which destructor runs FIRST?', 'B) The derived class destructor', ['A) The base class destructor', 'B) The derived class destructor', 'C) Both run simultaneously', 'D) Neither if no dynamic memory']);
  add('oneword', 'Constructors are called in order from base to derived. Destructors are called in ______ order. (one word)', 'reverse');

  // --- Miscellaneous Harder Concepts ---
  add('mcq', 'A class has a pointer member allocated with new. Which rule says you should define a destructor, copy constructor, AND assignment operator?', 'C) Rule of Three', ['A) Rule of One', 'B) Rule of Two', 'C) Rule of Three', 'D) Rule of Five']);
  add('mcq', 'What is object slicing in C++?', 'B) When a derived object is assigned to a base object, the derived part is lost', ['A) When an object is split into arrays', 'B) When a derived object is assigned to a base object, the derived part is lost', 'C) When memory is deallocated partially', 'D) When a pointer is cast to void']);
  add('oneword', 'When you pass a derived class object by value to a function expecting a base class, the derived data is lost. This is called object ______. (one word)', 'slicing');
  add('mcq', 'The technique of hiding implementation details and exposing only the interface is called:', 'D) Abstraction', ['A) Encapsulation', 'B) Polymorphism', 'C) Inheritance', 'D) Abstraction']);
  add('mcq', 'An abstract class with ALL pure virtual functions and no data members acts like a(n):', 'B) Interface', ['A) Concrete class', 'B) Interface', 'C) Template', 'D) Namespace']);
  add('mcq', 'Which of the following is an example of compile-time polymorphism?', 'A) Function overloading', ['A) Function overloading', 'B) Virtual function calls', 'C) Dynamic casting', 'D) Pointer-based dispatch']);
  add('mcq', 'Which of the following is an example of run-time polymorphism?', 'B) Virtual function call through a base pointer', ['A) Function overloading', 'B) Virtual function call through a base pointer', 'C) Operator overloading', 'D) Default arguments']);

  // --- Additional Harder Conceptual Questions ---
  add('mcq', 'If a base class pointer points to a derived class object, and the function is NOT virtual, which version gets called?', 'A) The base class version — static binding is used', ['A) The base class version — static binding is used', 'B) The derived class version', 'C) Both versions', 'D) Compiler error']);
  add('mcq', 'What happens if you forget to make the base class destructor virtual and delete a derived object through a base pointer?', 'C) Only the base destructor runs — derived resources may leak (undefined behavior)', ['A) Both destructors run correctly', 'B) Compiler error', 'C) Only the base destructor runs — derived resources may leak (undefined behavior)', 'D) The program crashes immediately']);
  add('oneword', 'A class that provides a common interface but cannot be instantiated on its own is called an ______ class. (one word)', 'abstract');
  add('mcq', 'Can a pure virtual function have a body (definition) in C++?', 'A) Yes — a pure virtual function CAN have a body, but derived classes must still override it', ['A) Yes — a pure virtual function CAN have a body, but derived classes must still override it', 'B) No — it is strictly forbidden', 'C) Only if marked as final', 'D) Only in the derived class']);
  add('mcq', 'What is the difference between aggregation and composition?', 'B) In composition the part cannot exist without the whole; in aggregation it can', ['A) They are the same thing', 'B) In composition the part cannot exist without the whole; in aggregation it can', 'C) Aggregation uses pointers, composition uses references', 'D) Composition is for inheritance, aggregation is for encapsulation']);
  add('mcq', 'Which of the following operators CANNOT be overloaded in C++?', 'C) . (dot operator)', ['A) + (addition)', 'B) [] (subscript)', 'C) . (dot operator)', 'D) () (function call)']);
  add('mcq', 'When overloading the << operator for cout, it is typically declared as:', 'B) A friend function of the class', ['A) A member function of the class', 'B) A friend function of the class', 'C) A static function', 'D) A virtual function']);
  add('oneword', 'When a derived class has a function with the same name as the base class, the base version is ______ in the derived class scope. (one word)', 'hidden');
  add('mcq', 'In a diamond inheritance scenario with virtual inheritance, who is responsible for calling the grandparent constructor?', 'D) The most-derived class', ['A) The first intermediate class', 'B) The second intermediate class', 'C) Both intermediate classes', 'D) The most-derived class']);
  add('mcq', 'Which relationship is described by "a Car HAS-A Engine and the Engine is destroyed when the Car is destroyed"?', 'A) Composition', ['A) Composition', 'B) Aggregation', 'C) Inheritance', 'D) Friendship']);
  add('mcq', 'What is the benefit of using virtual functions with base class pointers?', 'B) It enables runtime polymorphism — the correct derived function is called', ['A) It makes the code compile faster', 'B) It enables runtime polymorphism — the correct derived function is called', 'C) It prevents memory leaks', 'D) It allows access to private members']);
  add('mcq', 'If you overload the = (assignment) operator but NOT the copy constructor, what risk do you have with dynamic memory?', 'C) Object initialization (copy) still does a shallow copy, causing potential double-free', ['A) No risk — the compiler handles it', 'B) The assignment operator handles both cases', 'C) Object initialization (copy) still does a shallow copy, causing potential double-free', 'D) Compilation error']);

  await adminService.seedQuestionsForLevel(3, questions);
  console.log('Level 3 seeded with 55 questions!');
  await app.close();
}

bootstrap().catch(console.error);
