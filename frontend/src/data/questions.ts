export type QuestionType = 'oneword' | 'code' | 'mcq' | 'output' | 'error' | 'design' | 'complete';

export interface Question {
  id: number;
  level: number;
  type: QuestionType;
  text: string;
  code?: string;
  options?: string[];
  correct: string;
}

export const questionBank: Question[] = [
  // Level 1: Basic OOP Concepts (1-5)
  { id: 1, level: 1, type: 'mcq', text: 'I keep my information locked away. Outsiders cannot touch it directly. But if you knock through the right doors, I may allow you to read or modify it. What am I?', options: ['A) Inheritance', 'B) Encapsulation', 'C) Polymorphism', 'D) Abstraction'], correct: 'B) Encapsulation' },
  { id: 2, level: 1, type: 'mcq', text: 'A child may inherit traits from a parent. In programming I allow a new class to gain abilities from an existing one. What am I?', options: ['A) Encapsulation', 'B) Inheritance', 'C) Polymorphism', 'D) Composition'], correct: 'B) Inheritance' },
  { id: 3, level: 1, type: 'mcq', text: 'You call my name the same way every time, but depending on the situation I might behave differently. What am I?', options: ['A) Encapsulation', 'B) Abstraction', 'C) Polymorphism', 'D) Inheritance'], correct: 'C) Polymorphism' },
  { id: 4, level: 1, type: 'mcq', text: 'Users see what I do, but they do not see how I do it. What am I?', options: ['A) Encapsulation', 'B) Inheritance', 'C) Implementation', 'D) Abstraction'], correct: 'D) Abstraction' },
  { id: 5, level: 1, type: 'mcq', text: 'Which access specifier allows members only inside the class?', options: ['A) Public', 'B) Private', 'C) Protected', 'D) Static'], correct: 'B) Private' },

  // Level 2: Constructors & Destructors (6-10)
  { id: 6, level: 2, type: 'mcq', text: 'You rarely call me directly, yet I appear whenever a new object is created. What am I?', options: ['A) Destructor', 'B) Constructor', 'C) Initializer', 'D) Operator'], correct: 'B) Constructor' },
  { id: 7, level: 2, type: 'mcq', text: 'When an object's life comes to an end, I quietly clean up the resources it used. What am I?', options: ['A) Constructor', 'B) Finalizer', 'C) Destructor', 'D) Cleanup Handler'], correct: 'C) Destructor' },
  { id: 8, level: 2, type: 'mcq', text: 'Which function runs when an object is created?', options: ['A) Destructor', 'B) Constructor', 'C) Operator', 'D) Friend'], correct: 'B) Constructor' },
  { id: 9, level: 2, type: 'mcq', text: 'Which function runs when an object is destroyed?', options: ['A) Constructor', 'B) Destructor', 'C) Static', 'D) Main'], correct: 'B) Destructor' },
  { id: 10, level: 2, type: 'mcq', text: 'Can constructors be virtual?', options: ['A) Yes', 'B) No'], correct: 'B) No' },

  // Level 3: Advanced Concepts & Syntax (11-15)
  { id: 11, level: 3, type: 'mcq', text: 'I allow my children to use my resources, but outsiders cannot access them. What am I?', options: ['A) Public', 'B) Private', 'C) Protected', 'D) Internal'], correct: 'C) Protected' },
  { id: 12, level: 3, type: 'mcq', text: 'I describe what something should look like, but I cannot exist on my own. Only my children can bring my design to life. What am I?', options: ['A) Interface', 'B) Template', 'C) Abstract Class', 'D) Virtual Class'], correct: 'C) Abstract Class' },
  { id: 13, level: 3, type: 'mcq', text: 'Which line has the syntax error and what\'s wrong?', code: `class Student\n{\nprivate:\n    int id;\n\npublic:\n    void setID(int id)\n    {\n        id = id;\n    }\n};`, options: ['A) Line 4 - Missing data type', 'B) Line 7 - Missing parameter name', 'C) Line 9 - Missing "this" pointer reference', 'D) Line 11 - Missing semicolon'], correct: 'C) Line 9 - Missing "this" pointer reference' },
  { id: 14, level: 3, type: 'mcq', text: 'Which line has the syntax error and what\'s wrong?', code: `class Car\n{\npublic:\n    Car()\n    {\n        cout << "Car created";\n    }\n};\n\nint main()\n{\n    Car c();\n}`, options: ['A) Line 4 - Missing return type', 'B) Line 12 - Incorrect object instantiation syntax', 'C) Line 10 - Missing function name', 'D) Line 13 - Missing closing brace'], correct: 'B) Line 12 - Incorrect object instantiation syntax' },
  { id: 15, level: 3, type: 'mcq', text: 'Which line has the syntax error and what\'s wrong?', code: `class Animal\n{\npublic:\n    void speak()\n    {\n        cout << "Animal sound";\n    }\n}`, options: ['A) Line 4 - Missing parameter declaration', 'B) Line 6 - Incorrect cout syntax', 'C) Line 8 - Missing semicolon after closing brace', 'D) Line 10 - Code is never compiled'], correct: 'C) Line 8 - Missing semicolon after closing brace' },

  // Level 4: Output Prediction & Memory (16-20)
  { id: 16, level: 4, type: 'mcq', text: 'What will be printed?', code: `class A { public: void display() { cout << "A"; } };\nclass B : public A { public: void display() { cout << "B"; } };\nint main() { A* obj = new B(); obj->display(); }`, options: ['A', 'B', 'Compiler Error', 'Undefined'], correct: 'A' },
  { id: 17, level: 4, type: 'mcq', text: 'How many times will constructor run?', code: `class Test { public: Test() { cout << "Hello"; } };\nint main() { Test t1; Test t2 = t1; }`, options: ['0', '1', '2', '3'], correct: '1' },
  { id: 18, level: 4, type: 'mcq', text: 'Which keyword allocates memory dynamically?', options: ['A) malloc', 'B) alloc', 'C) new', 'D) create'], correct: 'C) new' },
  { id: 19, level: 4, type: 'mcq', text: 'A class with a pure virtual function becomes:', options: ['A) Concrete', 'B) Abstract', 'C) Static', 'D) Template'], correct: 'B) Abstract' },
  { id: 20, level: 4, type: 'mcq', text: 'Can destructors be virtual?', options: ['A) Yes', 'B) No'], correct: 'A) Yes' },

  // Level 5: Patterns & Deep Knowledge (21-25)
  { id: 21, level: 5, type: 'mcq', text: 'No matter how many times you try, only one version of me will exist in the entire program. What is this design pattern?', options: ['A) Factory', 'B) Singleton', 'C) Observer', 'D) Strategy'], correct: 'B) Singleton' },
  { id: 22, level: 5, type: 'mcq', text: 'Sometimes I work at compile time, sometimes at runtime, allowing the same interface to behave differently. What am I?', options: ['A) Overloading', 'B) Overriding', 'C) Polymorphism', 'D) Inheritance'], correct: 'C) Polymorphism' },
  { id: 23, level: 5, type: 'mcq', text: 'Which concept hides internal data and allows access only through methods?', options: ['A) Inheritance', 'B) Encapsulation', 'C) Polymorphism', 'D) Abstraction'], correct: 'B) Encapsulation' },
  { id: 24, level: 5, type: 'mcq', text: 'Which feature allows code reuse using relationships between classes?', options: ['A) Inheritance', 'B) Encapsulation', 'C) Constructor', 'D) Destructor'], correct: 'A) Inheritance' },
  { id: 25, level: 5, type: 'mcq', text: 'Which concept allows the same function name to perform different tasks?', options: ['A) Abstraction', 'B) Encapsulation', 'C) Polymorphism', 'D) Compilation'], correct: 'C) Polymorphism' }
];
