import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { AdminService } from '../admin/admin.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const adminService = app.get(AdminService);

  console.log('Seeding Level 5 (65 questions — error/bug finding)...');

  const questions = [];
  let id = 501;
  const add = (type: string, text: string, answer: string, opts?: string[]) => {
    questions.push({ id: id++, level: 5, roundKey: 'round1', type, text, correct: answer, options: opts || null, isActive: true });
  };

  // ═══════════════════════════════════════════
  // LEVEL 5 — Error & Bug Finding (MCQ)
  // "What is WRONG?" / "Find the bug" / "What error?"
  // Topics: syntax errors, logical errors, memory issues,
  //         constructor/destructor mistakes, inheritance bugs,
  //         access violations, missing virtual, slicing, etc.
  // ═══════════════════════════════════════════

  // --- Abstract Class / Pure Virtual ---
  add('mcq', 'What is WRONG with this code?\n\nclass Shape {\npublic:\n  virtual double area() = 0;\n};\nint main() { Shape s; }', 'B) Cannot instantiate an abstract class', ['A) area() needs a body', 'B) Cannot instantiate an abstract class', 'C) virtual keyword is wrong here', 'D) Missing semicolon']);

  add('mcq', 'What is the error?\n\nclass Animal {\npublic:\n  virtual void speak() = 0;\n};\nclass Dog : public Animal {\n};\nint main() { Dog d; }', 'C) Dog does not implement speak() — it is still abstract', ['A) Dog needs a constructor', 'B) Animal needs a destructor', 'C) Dog does not implement speak() — it is still abstract', 'D) speak() cannot be pure virtual']);

  add('mcq', 'What is WRONG here?\n\nclass Base {\npublic:\n  virtual void f() = 0;\n  Base() { f(); }\n};\nclass Der : public Base {\npublic:\n  void f() { cout << "D"; }\n};\nint main() { Der d; }', 'A) Calling a pure virtual function from a constructor is undefined behavior', ['A) Calling a pure virtual function from a constructor is undefined behavior', 'B) Der does not inherit f()', 'C) Missing virtual destructor', 'D) No error — output is "D"']);

  // --- Access Specifier Violations ---
  add('mcq', 'What is the error?\n\nclass Secret {\n  int code;\npublic:\n  Secret(int c) : code(c) {}\n};\nint main() {\n  Secret s(42);\n  cout << s.code;\n}', 'A) code is private — cannot be accessed from main()', ['A) code is private — cannot be accessed from main()', 'B) Constructor is wrong', 'C) cout cannot print int', 'D) Missing default constructor']);

  add('mcq', 'What is WRONG?\n\nclass A {\nprotected:\n  int x;\n};\nint main() {\n  A a;\n  a.x = 5;\n}', 'B) x is protected — cannot be accessed from outside the class', ['A) x is not initialized', 'B) x is protected — cannot be accessed from outside the class', 'C) A needs a constructor', 'D) No error']);

  add('mcq', 'Find the bug:\n\nclass Base {\nprivate:\n  int val;\npublic:\n  Base(int v) : val(v) {}\n};\nclass Child : public Base {\npublic:\n  Child(int v) : Base(v) {}\n  void show() { cout << val; }\n};', 'C) val is private in Base — Child cannot access it directly', ['A) Child constructor is wrong', 'B) Missing default constructor in Base', 'C) val is private in Base — Child cannot access it directly', 'D) show() should be const']);

  // --- Missing virtual keyword ---
  add('mcq', 'What is the bug in this code?\n\nclass Animal {\npublic:\n  void speak() { cout << "..."; }\n};\nclass Dog : public Animal {\npublic:\n  void speak() { cout << "Woof"; }\n};\nint main() {\n  Animal* p = new Dog();\n  p->speak();\n  delete p;\n}', 'A) speak() is not virtual — "..." will print instead of "Woof"', ['A) speak() is not virtual — "..." will print instead of "Woof"', 'B) Dog cannot override speak()', 'C) Memory leak', 'D) No error — output is "Woof"']);

  add('mcq', 'What is the problem?\n\nclass Base {\npublic:\n  ~Base() { cout << "B"; }\n};\nclass Der : public Base {\n  int* data;\npublic:\n  Der() { data = new int(5); }\n  ~Der() { delete data; cout << "D"; }\n};\nint main() {\n  Base* p = new Der();\n  delete p;\n}', 'B) Base destructor is not virtual — Der destructor will not be called (memory leak)', ['A) data should be deleted in Base', 'B) Base destructor is not virtual — Der destructor will not be called (memory leak)', 'C) Cannot delete through base pointer', 'D) No error']);

  // --- Constructor Issues ---
  add('mcq', 'What is WRONG?\n\nclass A {\npublic:\n  A(int x) { cout << x; }\n};\nclass B : public A {\npublic:\n  B() { cout << "B"; }\n};\nint main() { B b; }', 'C) Base class A has no default constructor — B() must explicitly call A(int)', ['A) B should not print "B"', 'B) A needs a destructor', 'C) Base class A has no default constructor — B() must explicitly call A(int)', 'D) No error']);

  add('mcq', 'Find the error:\n\nclass MyClass {\n  const int x;\npublic:\n  MyClass() { x = 10; }\n};', 'A) const member x must be initialized in the member initialization list, not assigned in the body', ['A) const member x must be initialized in the member initialization list, not assigned in the body', 'B) x should not be const', 'C) Missing destructor', 'D) No error']);

  add('mcq', 'What is WRONG here?\n\nclass A {\npublic:\n  A(int x) {}\n};\nint main() { A a; }', 'B) No default constructor — defining A(int) suppresses the compiler-generated default', ['A) A(int) is invalid', 'B) No default constructor — defining A(int) suppresses the compiler-generated default', 'C) Missing return type', 'D) No error']);

  // --- Copy / Assignment Issues ---
  add('mcq', 'What is the bug?\n\nclass Arr {\n  int* data;\npublic:\n  Arr() { data = new int[10]; }\n  ~Arr() { delete[] data; }\n};\nint main() {\n  Arr a;\n  Arr b = a;\n}', 'A) No copy constructor — both a and b point to the same memory, causing double delete', ['A) No copy constructor — both a and b point to the same memory, causing double delete', 'B) data should use delete not delete[]', 'C) Missing default value', 'D) No error']);

  add('mcq', 'What is the problem?\n\nclass Str {\n  char* s;\npublic:\n  Str(const char* p) { s = new char[strlen(p)+1]; strcpy(s, p); }\n  ~Str() { delete[] s; }\n};\nint main() {\n  Str a("hello");\n  Str b("world");\n  b = a;\n}', 'B) No assignment operator — b\'s old memory leaks, and both objects share the same pointer', ['A) strcpy is not allowed', 'B) No assignment operator — b\'s old memory leaks, and both objects share the same pointer', 'C) strlen returns wrong size', 'D) No error']);

  add('mcq', 'What rule is being violated here?\n\nclass Resource {\n  int* ptr;\npublic:\n  Resource() { ptr = new int(0); }\n  ~Resource() { delete ptr; }\n  // No copy constructor or assignment operator defined\n};', 'C) The Rule of Three — if you define a destructor, you should also define copy constructor and assignment operator', ['A) Rule of One', 'B) Rule of Two', 'C) The Rule of Three — if you define a destructor, you should also define copy constructor and assignment operator', 'D) No rule is violated']);

  // --- Syntax Errors ---
  add('mcq', 'Find the syntax error:\n\nclass Shape {\npublic\n  virtual double area() = 0;\n};', 'A) Missing colon after "public"', ['A) Missing colon after "public"', 'B) area() needs a body', 'C) virtual is not allowed here', 'D) Missing semicolon after }']);

  add('mcq', 'Find the error:\n\nclass A {\npublic:\n  void show();\n}\nint main() {\n  A a;\n  a.show();\n}', 'B) Missing semicolon after the closing brace of the class definition', ['A) show() needs a body inside the class', 'B) Missing semicolon after the closing brace of the class definition', 'C) A needs a constructor', 'D) No error']);

  add('mcq', 'What is wrong?\n\nclass A {\npublic:\n  int A() { return 0; }\n};', 'A) Constructors cannot have a return type', ['A) Constructors cannot have a return type', 'B) A() should be private', 'C) return 0 is invalid', 'D) No error']);

  add('mcq', 'Find the error:\n\nclass A {\npublic:\n  ~A(int x) { cout << x; }\n};', 'C) Destructors cannot take parameters', ['A) Destructors need return type', 'B) x should be a reference', 'C) Destructors cannot take parameters', 'D) No error']);

  // --- Memory Leaks ---
  add('mcq', 'Spot the memory leak:\n\nvoid process() {\n  int* arr = new int[100];\n  cout << arr[0];\n}\nint main() { process(); }', 'B) Memory allocated with new[] is never freed — needs delete[]', ['A) arr[0] is uninitialized', 'B) Memory allocated with new[] is never freed — needs delete[]', 'C) Cannot use cout with arrays', 'D) No leak']);

  add('mcq', 'What is the issue?\n\nvoid f() {\n  int* p = new int(5);\n  int* q = new int(10);\n  p = q;\n  delete p;\n}', 'A) The original memory pointed to by p is leaked — p was reassigned before freeing', ['A) The original memory pointed to by p is leaked — p was reassigned before freeing', 'B) q is deleted twice', 'C) Cannot assign pointers', 'D) No issue']);

  add('mcq', 'Find the bug:\n\nclass Node {\npublic:\n  int val;\n  Node* next;\n  Node(int v) : val(v), next(nullptr) {}\n};\nint main() {\n  Node* head = new Node(1);\n  head->next = new Node(2);\n  delete head;\n}', 'C) Only head is deleted — head->next is leaked', ['A) next should be initialized to NULL', 'B) Constructor is wrong', 'C) Only head is deleted — head->next is leaked', 'D) No bug']);

  // --- Logical Errors ---
  add('mcq', 'What is wrong here?\n\nclass MyClass {\n  int x;\npublic:\n  void setX(int x) { x = x; }\n  int getX() { return x; }\n};', 'B) x = x assigns the parameter to itself — should be this->x = x', ['A) setX should return void', 'B) x = x assigns the parameter to itself — should be this->x = x', 'C) getX should be static', 'D) No error']);

  add('mcq', 'What is the issue?\n\nclass Stack {\n  int arr[100];\n  int top;\npublic:\n  Stack() { top = 0; }\n  void push(int x) { arr[top++] = x; }\n  int pop() { return arr[top--]; }\n};', 'A) pop() returns arr[top] before decrementing — should be arr[--top]', ['A) pop() returns arr[top] before decrementing — should be arr[--top]', 'B) arr overflows', 'C) top should be -1', 'D) No issue']);

  // --- Inheritance Bugs ---
  add('mcq', 'What happens here?\n\nclass Base {\npublic:\n  void show() { cout << "Base"; }\n};\nclass Der : public Base {\npublic:\n  void show(int x) { cout << x; }\n};\nint main() {\n  Der d;\n  d.show();\n}', 'C) Error — Der::show(int) hides Base::show(), and no matching show() with no arguments', ['A) Prints "Base"', 'B) Prints 0', 'C) Error — Der::show(int) hides Base::show(), and no matching show() with no arguments', 'D) Prints nothing']);

  add('mcq', 'What is the problem with this code?\n\nclass A {\npublic:\n  virtual void speak() { cout << "A"; }\n};\nclass B : public A {\npublic:\n  void speak() { cout << "B"; }\n};\nvoid f(A a) { a.speak(); }\nint main() {\n  B b;\n  f(b);\n}', 'A) Object slicing — passing by value to f() slices off B\'s part, "A" is printed', ['A) Object slicing — passing by value to f() slices off B\'s part, "A" is printed', 'B) Cannot pass derived to base function', 'C) speak() is not virtual enough', 'D) No problem — output is "B"']);

  add('mcq', 'What is the error?\n\nclass Base {\npublic:\n  virtual void f() = 0;\n};\nclass Mid : public Base {\n};\nclass Top : public Mid {\npublic:\n  void f() { cout << "T"; }\n};\nint main() { Mid m; }', 'B) Mid does not implement f() — it is still abstract and cannot be instantiated', ['A) Top should inherit from Base', 'B) Mid does not implement f() — it is still abstract and cannot be instantiated', 'C) f() cannot be pure virtual', 'D) No error']);

  // --- Const Errors ---
  add('mcq', 'What is WRONG?\n\nclass Data {\n  int x;\npublic:\n  Data(int v) : x(v) {}\n  void show() { cout << x; }\n};\nint main() {\n  const Data d(5);\n  d.show();\n}', 'A) show() is not const — a const object cannot call a non-const member function', ['A) show() is not const — a const object cannot call a non-const member function', 'B) d cannot be initialized', 'C) cout cannot print const values', 'D) No error']);

  add('mcq', 'Find the error:\n\nclass A {\n  int x;\npublic:\n  A(int v) : x(v) {}\n  void modify() const { x = 10; }\n};', 'C) Cannot modify member x inside a const member function', ['A) x should be static', 'B) modify() should return int', 'C) Cannot modify member x inside a const member function', 'D) No error']);

  // --- Static Errors ---
  add('mcq', 'What is WRONG?\n\nclass A {\n  int x;\npublic:\n  static void show() { cout << x; }\n};', 'B) Static function show() cannot access non-static member x', ['A) show() needs to return int', 'B) Static function show() cannot access non-static member x', 'C) x needs to be public', 'D) No error']);

  add('mcq', 'Find the error:\n\nclass Counter {\npublic:\n  static int count;\n};\nint main() {\n  cout << Counter::count;\n}', 'A) Static member count is declared but never defined outside the class', ['A) Static member count is declared but never defined outside the class', 'B) count should not be static', 'C) Cannot use :: with static', 'D) No error']);

  // --- Miscellaneous Bugs ---
  add('mcq', 'What is wrong with this operator overload?\n\nclass Vec {\n  int x, y;\npublic:\n  Vec(int a, int b) : x(a), y(b) {}\n  Vec operator+(Vec v) {\n    x += v.x;\n    y += v.y;\n    return *this;\n  }\n};', 'A) The + operator modifies the left operand — it should create and return a new object instead', ['A) The + operator modifies the left operand — it should create and return a new object instead', 'B) Cannot access v.x directly', 'C) operator+ needs to be a friend', 'D) No error']);

  add('mcq', 'What happens here?\n\nclass A {\npublic:\n  int x;\n};\nclass B : private A {\npublic:\n  void show() { cout << x; }\n};\nint main() {\n  B b;\n  cout << b.x;\n}', 'C) x was public in A, but private inheritance makes it private in B — cannot access from main()', ['A) x is not initialized', 'B) B cannot access x', 'C) x was public in A, but private inheritance makes it private in B — cannot access from main()', 'D) No error']);

  add('mcq', 'What is the issue?\n\nclass A {\npublic:\n  A() { cout << "A"; }\n};\nclass B {\npublic:\n  B() { cout << "B"; }\n};\nclass C : public A {\n  B b;\npublic:\n  C() { cout << "C"; }\n};\nint main() {\n  C c;\n  // Expected: CAB\n}', 'B) The expected output is wrong — actual order is ABC (base first, then members, then derived body)', ['A) B should inherit from A', 'B) The expected output is wrong — actual order is ABC (base first, then members, then derived body)', 'C) C constructor should call A()', 'D) No issue — output is CAB']);

  add('mcq', 'Find the bug:\n\nclass Matrix {\n  int** data;\n  int rows, cols;\npublic:\n  Matrix(int r, int c) : rows(r), cols(c) {\n    data = new int*[rows];\n    for(int i = 0; i < rows; i++)\n      data[i] = new int[cols];\n  }\n  ~Matrix() { delete[] data; }\n};', 'A) Only the array of pointers is deleted — the individual rows are leaked (needs a loop to delete each row)', ['A) Only the array of pointers is deleted — the individual rows are leaked (needs a loop to delete each row)', 'B) data should use delete not delete[]', 'C) Constructor allocates wrong size', 'D) No bug']);

  add('mcq', 'What is WRONG?\n\nclass Circle {\n  double radius;\npublic:\n  Circle(double r) : radius(r) {}\n  double area() { return 3.14 * radius * radius; }\n};\nclass Cylinder : public Circle {\n  double height;\npublic:\n  Cylinder(double r, double h) : height(h) {}\n  double volume() { return area() * height; }\n};', 'C) Cylinder constructor does not pass r to Circle(double) — Circle has no default constructor', ['A) area() should be virtual', 'B) height is not initialized', 'C) Cylinder constructor does not pass r to Circle(double) — Circle has no default constructor', 'D) No error']);

  add('mcq', 'Find the problem:\n\nclass A {\npublic:\n  virtual void f() { cout << "A"; }\n};\nclass B : public A {\npublic:\n  void f(int x) { cout << "B" << x; }\n};\nint main() {\n  A* p = new B();\n  p->f();\n}', 'B) B::f(int) does not override A::f() — different signature. Output is "A", not "B"', ['A) Cannot call f() through pointer', 'B) B::f(int) does not override A::f() — different signature. Output is "A", not "B"', 'C) Missing virtual in B', 'D) No problem — output is "B"']);

  add('mcq', 'Spot the issue:\n\nclass Base {\npublic:\n  virtual void process() { cout << "Base"; }\n};\nclass Der : public Base {\npublic:\n  void process() const { cout << "Der"; }\n};\nint main() {\n  Base* p = new Der();\n  p->process();\n}', 'A) Der::process() const does not override Base::process() — const changes the signature. Output is "Base"', ['A) Der::process() const does not override Base::process() — const changes the signature. Output is "Base"', 'B) const functions cannot use cout', 'C) Cannot use virtual with const', 'D) No issue — output is "Der"']);

  add('mcq', 'What is the error?\n\nclass Singleton {\n  static Singleton* instance;\n  Singleton() {}\npublic:\n  static Singleton* get() {\n    if (!instance) instance = new Singleton();\n    return instance;\n  }\n};\nint main() {\n  Singleton s;\n}', 'B) Constructor is private — cannot create Singleton object directly in main()', ['A) instance is never initialized', 'B) Constructor is private — cannot create Singleton object directly in main()', 'C) get() should not be static', 'D) No error']);

  // --- Returning Reference to Local ---
  add('mcq', 'What is WRONG?\n\nclass Data {\n  int x;\npublic:\n  Data(int v) : x(v) {}\n  int& getRef() {\n    int temp = x;\n    return temp;\n  }\n};', 'A) Returning reference to local variable temp — it is destroyed when the function returns', ['A) Returning reference to local variable temp — it is destroyed when the function returns', 'B) x should be public', 'C) getRef() should be const', 'D) No error']);

  // --- delete vs delete[] ---
  add('mcq', 'Find the bug:\n\nvoid process() {\n  int* arr = new int[100];\n  arr[0] = 42;\n  delete arr;\n}', 'B) Using delete instead of delete[] on array allocated with new[] — undefined behavior', ['A) arr[0] is out of bounds', 'B) Using delete instead of delete[] on array allocated with new[] — undefined behavior', 'C) Cannot assign to arr[0]', 'D) No bug']);

  // --- Diamond Problem ---
  add('mcq', 'What is the error?\n\nclass A {\npublic:\n  int x;\n  A() : x(0) {}\n};\nclass B : public A {};\nclass C : public A {};\nclass D : public B, public C {};\nint main() {\n  D d;\n  d.x = 5;\n}', 'C) Ambiguous access to x — D has two copies of A without virtual inheritance', ['A) D cannot inherit from B and C', 'B) x is private', 'C) Ambiguous access to x — D has two copies of A without virtual inheritance', 'D) No error']);

  // --- Missing Return Statement ---
  add('mcq', 'What is WRONG?\n\nclass Calc {\n  int val;\npublic:\n  Calc(int v) : val(v) {}\n  int doubled() {\n    val *= 2;\n  }\n};', 'A) doubled() is declared to return int but has no return statement', ['A) doubled() is declared to return int but has no return statement', 'B) val should be public', 'C) Constructor is wrong', 'D) No error']);

  // --- Delete Stack Variable ---
  add('mcq', 'Find the bug:\n\nclass Handler {\npublic:\n  void process() {\n    int x = 10;\n    int* p = &x;\n    delete p;\n  }\n};', 'B) Calling delete on a pointer to a stack variable — undefined behavior', ['A) p is uninitialized', 'B) Calling delete on a pointer to a stack variable — undefined behavior', 'C) x should be dynamic', 'D) No bug']);

  // --- Dangling Pointer ---
  add('mcq', 'What is the problem?\n\nclass Factory {\npublic:\n  int* create() {\n    int val = 42;\n    return &val;\n  }\n};\nint main() {\n  Factory f;\n  int* p = f.create();\n  cout << *p;\n}', 'A) Returning address of local variable val — pointer dangles after function returns', ['A) Returning address of local variable val — pointer dangles after function returns', 'B) create() should return int', 'C) Missing destructor', 'D) No problem']);

  // --- this in Static ---
  add('mcq', 'Find the error:\n\nclass Logger {\n  int count;\npublic:\n  Logger() : count(0) {}\n  static void reset() { this->count = 0; }\n};', 'C) Cannot use this pointer inside a static member function', ['A) count should be static', 'B) reset() should return int', 'C) Cannot use this pointer inside a static member function', 'D) No error']);

  // --- Infinite Recursion ---
  add('mcq', 'What is WRONG?\n\nclass Widget {\npublic:\n  Widget() {\n    Widget w;\n    cout << "Created";\n  }\n};\nint main() { Widget obj; }', 'B) Infinite recursion — constructor creates a new Widget endlessly causing stack overflow', ['A) w is unused', 'B) Infinite recursion — constructor creates a new Widget endlessly causing stack overflow', 'C) Missing destructor', 'D) No error — prints "Created" once']);

  // --- Abstract Class as Value Parameter ---
  add('mcq', 'What is the error?\n\nclass Shape {\npublic:\n  virtual void draw() = 0;\n};\nclass Circle : public Shape {\npublic:\n  void draw() { cout << "Circle"; }\n};\nvoid render(Shape s) {\n  s.draw();\n}\nint main() {\n  Circle c;\n  render(c);\n}', 'A) Cannot declare parameter of abstract type Shape — use pointer or reference', ['A) Cannot declare parameter of abstract type Shape — use pointer or reference', 'B) Circle does not implement draw()', 'C) render should return Shape', 'D) No error']);

  // --- Modifying String Literal ---
  add('mcq', 'What is the bug?\n\nclass Label {\n  char* text;\npublic:\n  Label() { text = "hello"; }\n  void capitalize() { text[0] = \'H\'; }\n};\nint main() {\n  Label l;\n  l.capitalize();\n}', 'C) Modifying a string literal is undefined behavior — literals are in read-only memory', ['A) text should be const char*', 'B) capitalize() should be const', 'C) Modifying a string literal is undefined behavior — literals are in read-only memory', 'D) No bug']);

  // --- Static Member Initialized Inside Class ---
  add('mcq', 'What is the error?\n\nclass Config {\npublic:\n  static int maxRetries = 3;\n};', 'B) Non-const static data member cannot be initialized inside the class — must be defined outside', ['A) maxRetries should be private', 'B) Non-const static data member cannot be initialized inside the class — must be defined outside', 'C) static members cannot be int', 'D) No error']);

  // --- Non-covariant Return Type ---
  add('mcq', 'What is WRONG?\n\nclass Base {\npublic:\n  virtual int compute() { return 0; }\n};\nclass Der : public Base {\npublic:\n  double compute() { return 3.14; }\n};', 'A) Der::compute() returns double instead of int — return types are not covariant, invalid override', ['A) Der::compute() returns double instead of int — return types are not covariant, invalid override', 'B) compute() cannot be virtual', 'C) Der needs a constructor', 'D) No error']);

  // --- Reference Member Without Initializer List ---
  add('mcq', 'Find the error:\n\nclass Ref {\n  int& r;\npublic:\n  Ref(int& val) {\n    r = val;\n  }\n};', 'C) Reference member r must be initialized in the member initializer list, not assigned in the body', ['A) r should be a pointer', 'B) val should be const', 'C) Reference member r must be initialized in the member initializer list, not assigned in the body', 'D) No error']);

  // --- Double Delete ---
  add('mcq', 'What is the bug?\n\nvoid process() {\n  int* p = new int(42);\n  int* q = p;\n  delete p;\n  delete q;\n}', 'A) Double delete — p and q point to the same memory, deleting both is undefined behavior', ['A) Double delete — p and q point to the same memory, deleting both is undefined behavior', 'B) q should use new', 'C) Cannot copy pointers', 'D) No bug']);

  // --- Private Override Access ---
  add('mcq', 'What is the problem?\n\nclass Base {\npublic:\n  virtual void action() { cout << "Base"; }\n};\nclass Der : public Base {\nprivate:\n  void action() { cout << "Der"; }\n};\nint main() {\n  Der d;\n  d.action();\n}', 'B) action() is private in Der — cannot be called directly from main()', ['A) action() cannot override a public method', 'B) action() is private in Der — cannot be called directly from main()', 'C) Missing virtual in Der', 'D) No problem']);

  // --- Multiple Inheritance Method Ambiguity ---
  add('mcq', 'What is the error?\n\nclass A {\npublic:\n  void show() { cout << "A"; }\n};\nclass B {\npublic:\n  void show() { cout << "B"; }\n};\nclass C : public A, public B {};\nint main() {\n  C c;\n  c.show();\n}', 'C) Ambiguous call to show() — C inherits show() from both A and B', ['A) C needs its own show()', 'B) show() must be virtual', 'C) Ambiguous call to show() — C inherits show() from both A and B', 'D) No error']);

  // --- Uninitialized Pointer Dereference ---
  add('mcq', 'Find the bug:\n\nclass Node {\n  int* data;\npublic:\n  Node() {}\n  void set(int v) { *data = v; }\n};\nint main() {\n  Node n;\n  n.set(5);\n}', 'A) data pointer is never initialized — dereferencing uninitialized pointer is undefined behavior', ['A) data pointer is never initialized — dereferencing uninitialized pointer is undefined behavior', 'B) set() should return int', 'C) Node needs a destructor', 'D) No bug']);

  // --- operator= Returns void ---
  add('mcq', 'What is WRONG?\n\nclass Vec {\n  int* data;\n  int sz;\npublic:\n  Vec(int s) : sz(s) { data = new int[s]; }\n  void operator=(const Vec& v) {\n    delete[] data;\n    sz = v.sz;\n    data = new int[sz];\n    for(int i = 0; i < sz; i++) data[i] = v.data[i];\n  }\n};\nint main() {\n  Vec a(3), b(3), c(3);\n  a = b = c;\n}', 'B) operator= returns void — chained assignment a = b = c fails. Must return Vec&', ['A) Cannot use delete[] here', 'B) operator= returns void — chained assignment a = b = c fails. Must return Vec&', 'C) Missing copy constructor', 'D) No error']);

  // --- Self-Assignment in operator= ---
  add('mcq', 'Find the bug:\n\nclass Buffer {\n  int* data;\n  int size;\npublic:\n  Buffer(int s) : size(s) { data = new int[s]; }\n  ~Buffer() { delete[] data; }\n  Buffer& operator=(const Buffer& b) {\n    delete[] data;\n    size = b.size;\n    data = new int[size];\n    for(int i = 0; i < size; i++) data[i] = b.data[i];\n    return *this;\n  }\n};', 'C) No self-assignment check — if a = a, data is deleted before reading from itself', ['A) destructor should use delete', 'B) operator= should return void', 'C) No self-assignment check — if a = a, data is deleted before reading from itself', 'D) No bug']);

  // --- Exception in Destructor ---
  add('mcq', 'What is the problem?\n\nclass File {\n  bool open;\npublic:\n  File() : open(true) {}\n  ~File() {\n    if(open) throw runtime_error("Not closed");\n  }\n};', 'A) Throwing an exception from a destructor can cause std::terminate during stack unwinding', ['A) Throwing an exception from a destructor can cause std::terminate during stack unwinding', 'B) open should be a pointer', 'C) Destructors cannot have if statements', 'D) No problem']);

  // --- Non-const Method Through const Pointer ---
  add('mcq', 'What is the error?\n\nclass Data {\n  int x;\npublic:\n  Data(int v) : x(v) {}\n  void set(int v) { x = v; }\n};\nint main() {\n  const Data* p = new Data(5);\n  p->set(10);\n}', 'B) Cannot call non-const member function set() through a pointer to const', ['A) p should not be const', 'B) Cannot call non-const member function set() through a pointer to const', 'C) set() should be static', 'D) No error']);

  // --- Initialization Order Bug ---
  add('mcq', 'What is the bug?\n\nclass Config {\n  int area;\n  int width;\n  int height;\npublic:\n  Config(int w, int h) : width(w), height(h), area(width * height) {}\n};', 'A) Members are initialized in declaration order — area is initialized before width and height, using garbage values', ['A) Members are initialized in declaration order — area is initialized before width and height, using garbage values', 'B) Constructor should use assignment', 'C) area should be public', 'D) No bug']);

  // --- Assigning to const Member ---
  add('mcq', 'Find the error:\n\nclass Immutable {\n  const int id;\npublic:\n  Immutable(int i) : id(i) {}\n  void reset() { id = 0; }\n};', 'C) Cannot assign to const member id after initialization', ['A) id should not be const', 'B) reset() should be const', 'C) Cannot assign to const member id after initialization', 'D) No error']);

  // --- Forward Declaration as Complete Type ---
  add('mcq', 'What is the error?\n\nclass B;\nclass A {\n  B member;\npublic:\n  A() {}\n};\nclass B {\npublic:\n  int x;\n};', 'B) B is an incomplete type when used as a member — only pointers or references to forward-declared types are allowed', ['A) B must be defined before A', 'B) B is an incomplete type when used as a member — only pointers or references to forward-declared types are allowed', 'C) A needs a destructor', 'D) No error']);

  // --- Private Destructor ---
  add('mcq', 'What is WRONG?\n\nclass Restricted {\n  ~Restricted() {}\npublic:\n  Restricted() {}\n};\nint main() {\n  Restricted r;\n}', 'A) Destructor is private — compiler cannot destroy r when it goes out of scope', ['A) Destructor is private — compiler cannot destroy r when it goes out of scope', 'B) Constructor should be private', 'C) Missing copy constructor', 'D) No error']);

  // --- Array of Abstract Class ---
  add('mcq', 'What is the error?\n\nclass Shape {\npublic:\n  virtual void draw() = 0;\n};\nint main() {\n  Shape arr[5];\n}', 'C) Cannot create array of abstract class Shape — cannot instantiate abstract types', ['A) arr should be pointers', 'B) draw() needs a body', 'C) Cannot create array of abstract class Shape — cannot instantiate abstract types', 'D) No error']);

  // --- Operator Overload Wrong Parameter ---
  add('mcq', 'What is WRONG?\n\nclass Matrix {\n  int data[2][2];\npublic:\n  Matrix() {}\n  Matrix operator+(Matrix* other) {\n    Matrix r;\n    for(int i = 0; i < 2; i++)\n      for(int j = 0; j < 2; j++)\n        r.data[i][j] = data[i][j] + other->data[i][j];\n    return r;\n  }\n};\nint main() {\n  Matrix a, b;\n  Matrix c = a + b;\n}', 'A) operator+ takes a pointer but a + b passes an object — won\'t compile without matching signature', ['A) operator+ takes a pointer but a + b passes an object — won\'t compile without matching signature', 'B) data is not initialized', 'C) Cannot overload + for matrices', 'D) No error']);

  await adminService.seedQuestionsForLevel(5, questions);
  console.log('Level 5 seeded with 65 questions!');
  await app.close();
}

bootstrap().catch(console.error);
