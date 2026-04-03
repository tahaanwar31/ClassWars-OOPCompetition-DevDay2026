import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { AdminService } from '../admin/admin.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const adminService = app.get(AdminService);

  const questions: any[] = [];
  const level = 8;
  let questionId = 801;

  const add = (type: string, text: string, answer: string, opts?: string[]) => {
    questions.push({ id: questionId++, level, roundKey: 'round1', type, text, correct: answer, options: opts || null, isActive: true });
  };

  // LEVEL 8 — Expert Bug Detection & Output Prediction (85 questions)
  // 60 output prediction (oneword) + 25 MCQ (spot the bug)
  // 70% oneword / 30% MCQ

  const inst = 'What is the output? Write "error" if it won\'t compile. (one word, no spaces)';

  // ═══════════════════════════════════════════════════════════════
  // SECTION 1: OUTPUT PREDICTION — ONEWORD (60 questions)
  // ═══════════════════════════════════════════════════════════════

  // --- Virtual Function Dispatch (5) ---

  add('oneword', inst + '\n\nclass A {\npublic:\n  virtual void f() { cout << "A"; }\n};\nclass B : public A {\npublic:\n  void f() { cout << "B"; }\n};\nint main() {\n  A* p = new B();\n  p->f();\n}', 'B');

  add('oneword', inst + '\n\nclass A {\npublic:\n  void f() { cout << "A"; }\n};\nclass B : public A {\npublic:\n  void f() { cout << "B"; }\n};\nint main() {\n  A* p = new B();\n  p->f();\n}', 'A');

  add('oneword', inst + '\n\nclass A {\npublic:\n  virtual void f() { cout << "A"; }\n};\nclass B : public A {\npublic:\n  void f() { cout << "B"; }\n};\nclass C : public B {\npublic:\n  void f() { cout << "C"; }\n};\nint main() {\n  A* p = new C();\n  p->f();\n}', 'C');

  add('oneword', inst + '\n\nclass A {\npublic:\n  virtual void f() { cout << "X"; }\n};\nclass B : public A {\npublic:\n  void f() { cout << "Y"; }\n};\nint main() {\n  B b;\n  A& ref = b;\n  ref.f();\n}', 'Y');

  add('oneword', inst + '\n\nclass A {\npublic:\n  virtual void f() { cout << "1"; }\n};\nclass B : public A {};\nint main() {\n  B b;\n  b.f();\n}', '1');

  // --- Object Slicing (3) ---

  add('oneword', inst + '\n\nclass A {\npublic:\n  virtual void f() { cout << "A"; }\n};\nclass B : public A {\npublic:\n  void f() { cout << "B"; }\n};\nvoid call(A a) { a.f(); }\nint main() {\n  B b;\n  call(b);\n}', 'A');

  add('oneword', inst + '\n\nclass A {\npublic:\n  virtual void f() { cout << "A"; }\n};\nclass B : public A {\npublic:\n  void f() { cout << "B"; }\n};\nvoid call(A& a) { a.f(); }\nint main() {\n  B b;\n  call(b);\n}', 'B');

  add('oneword', inst + '\n\nclass A {\npublic:\n  virtual void f() { cout << "A"; }\n};\nclass B : public A {\npublic:\n  void f() { cout << "B"; }\n};\nint main() {\n  B b;\n  A a = b;\n  a.f();\n}', 'A');

  // --- Virtual Call in Constructor (1) ---

  add('oneword', inst + '\n\nclass A {\npublic:\n  A() { show(); }\n  virtual void show() { cout << "A"; }\n};\nclass B : public A {\npublic:\n  void show() { cout << "B"; }\n};\nint main() {\n  B b;\n}', 'A');

  // --- Polymorphic Array (1) ---

  add('oneword', inst + '\n\nclass A {\npublic:\n  virtual void f() = 0;\n};\nclass B : public A {\npublic:\n  void f() { cout << "B"; }\n};\nclass C : public A {\npublic:\n  void f() { cout << "C"; }\n};\nint main() {\n  A* x = new B();\n  A* y = new C();\n  x->f();\n  y->f();\n}', 'BC');

  // --- Constructor / Destructor Order (10) ---

  add('oneword', inst + '\n\nclass A {\npublic:\n  A() { cout << "A"; }\n};\nclass B : public A {\npublic:\n  B() { cout << "B"; }\n};\nint main() {\n  B b;\n}', 'AB');

  add('oneword', inst + '\n\nclass A {\npublic:\n  ~A() { cout << "A"; }\n};\nclass B : public A {\npublic:\n  ~B() { cout << "B"; }\n};\nint main() {\n  B b;\n}', 'BA');

  add('oneword', inst + '\n\nclass A {\npublic:\n  A() { cout << "1"; }\n  ~A() { cout << "2"; }\n};\nclass B : public A {\npublic:\n  B() { cout << "3"; }\n  ~B() { cout << "4"; }\n};\nint main() {\n  B b;\n}', '1342');

  add('oneword', inst + '\n\nclass A {\npublic:\n  A() { cout << "A"; }\n};\nclass B {\npublic:\n  B() { cout << "B"; }\n};\nclass C : public A {\n  B b;\npublic:\n  C() { cout << "C"; }\n};\nint main() {\n  C c;\n}', 'ABC');

  add('oneword', inst + '\n\nclass X {\npublic:\n  X() { cout << "X"; }\n  ~X() { cout << "x"; }\n};\nclass Y {\npublic:\n  Y() { cout << "Y"; }\n  ~Y() { cout << "y"; }\n};\nint main() {\n  X a;\n  Y b;\n}', 'XYyx');

  add('oneword', inst + '\n\nclass A {\npublic:\n  A() { cout << "A"; }\n  ~A() { cout << "a"; }\n};\nclass B : public A {\npublic:\n  B() { cout << "B"; }\n  ~B() { cout << "b"; }\n};\nclass C : public B {\npublic:\n  C() { cout << "C"; }\n  ~C() { cout << "c"; }\n};\nint main() {\n  C c;\n}', 'ABCcba');

  add('oneword', inst + '\n\nclass A {\npublic:\n  A(int x) { cout << x; }\n};\nclass B : public A {\npublic:\n  B() : A(5) { cout << 3; }\n};\nint main() {\n  B b;\n}', '53');

  add('oneword', inst + '\n\nclass A {\npublic:\n  A() { cout << "A"; }\n  A(const A&) { cout << "C"; }\n};\nint main() {\n  A a;\n  A b = a;\n}', 'AC');

  add('oneword', inst + '\n\nclass A {\npublic:\n  A() { cout << "1"; }\n  A(const A&) { cout << "2"; }\n  A& operator=(const A&) { cout << "3"; return *this; }\n};\nint main() {\n  A a;\n  A b;\n  b = a;\n}', '113');

  add('oneword', inst + '\n\nclass A {\npublic:\n  A(int x) { cout << x; }\n};\nclass B : public A {\npublic:\n  B(int a, int b) : A(a) { cout << b; }\n};\nint main() {\n  B obj(3, 7);\n}', '37');

  // --- Static Members (2) ---

  add('oneword', inst + '\n\nclass Counter {\n  static int count;\npublic:\n  Counter() { count++; }\n  static int getCount() { return count; }\n};\nint Counter::count = 0;\nint main() {\n  Counter a, b, c;\n  cout << Counter::getCount();\n}', '3');

  add('oneword', inst + '\n\nclass A {\n  static int n;\npublic:\n  A() { n++; }\n  int get() { return n; }\n};\nint A::n = 0;\nint main() {\n  A a, b;\n  cout << a.get() << b.get();\n}', '22');

  // --- Const, Mutable, Friend (3) ---

  add('oneword', inst + '\n\nclass A {\npublic:\n  int x;\n  A() : x(10) {}\n  void show() const { cout << x; }\n};\nint main() {\n  const A a;\n  a.show();\n}', '10');

  add('oneword', inst + '\n\nclass A {\npublic:\n  mutable int x;\n  A() : x(0) {}\n  void inc() const { x++; }\n};\nint main() {\n  const A a;\n  a.inc();\n  a.inc();\n  cout << a.x;\n}', '2');

  add('oneword', inst + '\n\nclass A {\n  int x;\npublic:\n  A(int v) : x(v) {}\n  friend void show(const A& a);\n};\nvoid show(const A& a) { cout << a.x; }\nint main() {\n  A obj(42);\n  show(obj);\n}', '42');

  // --- Operator Overloading (5) ---

  add('oneword', inst + '\n\nclass Num {\n  int v;\npublic:\n  Num(int x) : v(x) {}\n  Num operator+(const Num& o) const { return Num(v + o.v); }\n  void show() { cout << v; }\n};\nint main() {\n  Num a(4), b(6);\n  Num c = a + b;\n  c.show();\n}', '10');

  add('oneword', inst + '\n\nclass A {\n  int x;\npublic:\n  A(int v) : x(v) {}\n  A operator++() { x++; return *this; }\n  void show() { cout << x; }\n};\nint main() {\n  A a(5);\n  ++a;\n  a.show();\n}', '6');

  add('oneword', inst + '\n\nclass A {\n  int x;\npublic:\n  A(int v) : x(v) {}\n  operator int() { return x; }\n};\nint main() {\n  A a(7);\n  cout << a + 3;\n}', '10');

  add('oneword', inst + '\n\nclass A {\n  int x;\npublic:\n  A(int v = 0) : x(v) {}\n  A operator+(const A& o) const { return A(x + o.x); }\n  int get() { return x; }\n};\nint main() {\n  A a(2), b(3), c(4);\n  A d = a + b + c;\n  cout << d.get();\n}', '9');

  add('oneword', inst + '\n\nclass A {\n  int x;\npublic:\n  A(int v) : x(v) {}\n  bool operator==(const A& o) { return x == o.x; }\n};\nint main() {\n  A a(5), b(5);\n  cout << (a == b);\n}', '1');

  // --- Arithmetic, Pointers, Basics (5) ---

  add('oneword', inst + '\n\nint main() {\n  int a = 7, b = 2;\n  cout << a / b;\n}', '3');

  add('oneword', inst + '\n\nint main() {\n  int a = 1, b = 3;\n  cout << a / b;\n}', '0');

  add('oneword', inst + '\n\nint main() {\n  int arr[] = {10, 20, 30};\n  int* p = arr;\n  p++;\n  cout << *p;\n}', '20');

  add('oneword', inst + '\n\nvoid f(int x = 7) { cout << x; }\nint main() {\n  f();\n}', '7');

  add('oneword', inst + '\n\nint main() {\n  int x = 5;\n  cout << (x > 3 ? 1 : 0);\n}', '1');

  // --- Compile Error Detection (10) ---

  add('oneword', inst + '\n\nclass C {\n  int x;\npublic:\n  C() : x(5) {}\n  int getX() { return x; }\n};\nvoid show(const C& c) {\n  cout << c.getX();\n}\nint main() { C c; show(c); }', 'error');

  add('oneword', inst + '\n\nclass A {\npublic:\n  virtual void f() = 0;\n};\nint main() {\n  A a;\n}', 'error');

  add('oneword', inst + '\n\nclass A {\n  const int ID;\npublic:\n  A() { ID = 0; }\n  void show() { cout << ID; }\n};\nint main() { A a; a.show(); }', 'error');

  add('oneword', inst + '\n\nclass A {\npublic:\n  static void f() { cout << this->x; }\n  int x = 5;\n};\nint main() { A::f(); }', 'error');

  add('oneword', inst + '\n\nclass A {\npublic:\n  A(int v) {}\n};\nclass B {\n  A a;\npublic:\n  B() {}\n};\nint main() { B b; }', 'error');

  add('oneword', inst + '\n\nclass A {\n  int x;\npublic:\n  A() : x(0) {}\n  void f() const { x = 5; }\n};\nint main() { A a; a.f(); }', 'error');

  add('oneword', inst + '\n\nclass A {\nprotected:\n  int x;\npublic:\n  A() : x(10) {}\n};\nint main() {\n  A a;\n  cout << a.x;\n}', 'error');

  add('oneword', inst + '\n\nclass A {\npublic:\n  A(int v) {}\n};\nint main() {\n  A a;\n}', 'error');

  add('oneword', inst + '\n\nclass A {\n  int v;\npublic:\n  A(int x) : v(x) {}\n  void show() const;\n};\nvoid A::show() {\n  cout << v;\n}\nint main() { A a(5); a.show(); }', 'error');

  add('oneword', inst + '\n\nclass A {\npublic:\n  void f() { cout << "A"; }\n};\nclass B : protected A {\npublic:\n  void g() { f(); }\n};\nint main() {\n  B b;\n  A* p = &b;\n}', 'error');

  // --- Advanced Output Prediction (10) ---

  add('oneword', inst + '\n\nclass A {\npublic:\n  virtual void f() const { cout << "A"; }\n};\nclass B : public A {\npublic:\n  void f() { cout << "B"; }\n};\nint main() {\n  const A* p = new B();\n  p->f();\n}', 'A');

  add('oneword', inst + '\n\nvoid change(int x) { x = 99; }\nint main() {\n  int a = 5;\n  change(a);\n  cout << a;\n}', '5');

  add('oneword', inst + '\n\nclass A {\npublic:\n  virtual void f() { cout << "A"; }\n};\nclass B : public A {\npublic:\n  void f() override { cout << "B"; }\n};\nint main() {\n  A* p = new B();\n  p->f();\n}', 'B');

  add('oneword', inst + '\n\nclass A {\npublic:\n  A() { cout << "1"; }\n};\nclass B {\npublic:\n  B() { cout << "2"; }\n};\nclass C : public A, public B {\npublic:\n  C() { cout << "3"; }\n};\nint main() {\n  C c;\n}', '123');

  add('oneword', inst + '\n\nclass A {\npublic:\n  virtual ~A() { cout << "A"; }\n};\nclass B : public A {\npublic:\n  ~B() { cout << "B"; }\n};\nint main() {\n  A* p = new B();\n  delete p;\n}', 'BA');

  add('oneword', inst + '\n\nclass A {\npublic:\n  void f() { cout << 5; }\n};\nclass B : public A {\npublic:\n  void f() { A::f(); cout << 0; }\n};\nint main() {\n  B b;\n  b.f();\n}', '50');

  add('oneword', inst + '\n\nint main() {\n  int x = 2;\n  cout << (x > 5 ? x : 0);\n}', '0');

  add('oneword', inst + '\n\nint main() {\n  cout << 17 % 5;\n}', '2');

  add('oneword', inst + '\n\nclass A {\npublic:\n  A() { cout << "1"; }\n};\nclass B {\n  A a;\n  A b;\npublic:\n  B() { cout << "2"; }\n};\nint main() {\n  B obj;\n}', '112');

  add('oneword', inst + '\n\nvoid f(int n) {\n  if(n == 0) return;\n  cout << n;\n  f(n - 1);\n}\nint main() {\n  f(3);\n}', '321');

  // --- Extra Output Prediction (5) ---

  add('oneword', inst + '\n\nclass A {\npublic:\n  A() { cout << "A"; }\n};\nint main() {\n  A a, b, c;\n}', 'AAA');

  add('oneword', inst + '\n\nclass A {\n  int x;\npublic:\n  A() : x(0) {}\n  A& set(int v) { x = v; return *this; }\n  void show() { cout << x; }\n};\nint main() {\n  A a;\n  a.set(3).set(8);\n  a.show();\n}', '8');

  add('oneword', inst + '\n\nclass A {\npublic:\n  A() { cout << "1"; }\n  A(const A&) { cout << "2"; }\n};\nvoid f(A& a) {}\nint main() {\n  A a;\n  f(a);\n}', '1');

  add('oneword', inst + '\n\nint main() {\n  bool b = (3 > 5);\n  cout << b;\n}', '0');

  add('oneword', inst + '\n\nvoid change(int& x) { x = 99; }\nint main() {\n  int a = 5;\n  change(a);\n  cout << a;\n}', '99');

  // ═══════════════════════════════════════════════════════════════
  // SECTION 2: SPOT THE BUG — MCQ (25 questions)
  // ═══════════════════════════════════════════════════════════════

  add('mcq', 'What is the bug?\n\nclass Str {\n  char* buf;\npublic:\n  Str(const char* s) { buf = strdup(s); }\n  ~Str() { free(buf); }\n};\nint main() {\n  Str a("hi");\n  Str b = a;\n}', 'C) Shallow copy — both a and b free the same pointer', ['A) free() should be delete[] since buf was allocated in C++ code', 'B) strdup may return nullptr — missing null check causes crash', 'C) Shallow copy — both a and b free the same pointer', 'D) Str b = a calls operator= not the copy constructor']);

  add('mcq', 'What is wrong here?\n\nclass Animal {\npublic:\n  ~Animal() { cout << "Animal"; }\n  virtual void speak() = 0;\n};\nclass Dog : public Animal {\npublic:\n  void speak() { cout << "Woof"; }\n};\nint main() {\n  Animal* p = new Dog();\n  delete p;\n}', 'A) Destructor is not virtual — Dog part is not properly cleaned up', ['A) Destructor is not virtual — Dog part is not properly cleaned up', 'B) Dog does not properly override speak() — missing override keyword', 'C) Cannot use new Dog() since Animal is an abstract class', 'D) speak() is pure virtual so delete p causes undefined behavior']);

  add('mcq', 'What is wrong?\n\nclass Vec {\n  int* data;\n  int sz;\npublic:\n  Vec(int n) : sz(n) { data = new int[n]; }\n  ~Vec() { delete data; }\n};\nint main() { Vec v(5); }', 'C) Should be delete[] data for array allocation', ['A) Constructor should use data = new int(n) for single allocation', 'B) delete and delete[] behave the same for primitive type arrays', 'C) Should be delete[] data for array allocation', 'D) sz must be initialized before data in the initializer list']);

  add('mcq', 'What is the bug?\n\nclass Timer {\n  int* secs;\npublic:\n  Timer(int s) : secs(new int(s)) {}\n  Timer(const Timer& t) : secs(t.secs) {}\n  ~Timer() { delete secs; }\n};\nint main() {\n  Timer a(10);\n  Timer b(a);\n}', 'A) Copy constructor copies the pointer — double free on destruction', ['A) Copy constructor copies the pointer — double free on destruction', 'B) Copy constructor should be deleted to prevent copying Timer', 'C) Timer b(a) calls assignment operator, not copy constructor', 'D) secs should be allocated in constructor body not initializer list']);

  add('mcq', 'What is wrong?\n\nclass Queue {\n  int* data;\n  int head, tail;\npublic:\n  Queue() { data = new int[10]; head = tail = 0; }\n  Queue& operator=(const Queue& q) {\n    data = q.data;\n    head = q.head; tail = q.tail;\n    return *this;\n  }\n  ~Queue() { delete[] data; }\n};', 'C) Assignment operator does shallow copy — both delete the same array', ['A) operator= must return void to prevent misuse in chained assignment', 'B) operator= should take Queue by value for exception safety', 'C) Assignment operator does shallow copy — both delete the same array', 'D) head and tail need separate deep copy logic from the data pointer']);

  add('mcq', 'Find the memory leak:\n\nclass Node {\npublic:\n  int v;\n  Node* next;\n  Node(int x) : v(x), next(nullptr) {}\n};\nNode* build() {\n  Node* n = new Node(1);\n  n->next = new Node(2);\n  return n;\n}\nint main() {\n  build();\n}', 'B) Returned pointer is discarded — both nodes leak', ['A) build() should construct nodes on the stack, not the heap', 'B) Returned pointer is discarded — both nodes leak', 'C) Node needs a destructor that deletes next in the chain', 'D) n->next overwrites nullptr causing a dangling pointer issue']);

  add('mcq', 'Spot the infinite recursion risk:\n\nclass A {\npublic:\n  A(A a) { cout << "copy"; }\n};\nint main() { A x = A(x); }', 'B) Copy constructor takes A by value — causes infinite recursion', ['A) A has no default constructor so A x cannot be created', 'B) Copy constructor takes A by value — causes infinite recursion', 'C) A(x) constructs x from itself — x is not yet fully initialized', 'D) Cannot define a constructor that takes same class as parameter']);

  add('mcq', 'What is wrong?\n\nclass Pair {\npublic:\n  int a, b;\n  Pair(int x, int y) : a(x), b(y) {}\n  Pair reversed() const {\n    a = b; b = a;\n    return *this;\n  }\n};', 'B) reversed() is const but modifies member variables a and b', ['A) reversed() should return Pair& not Pair to enable chaining', 'B) reversed() is const but modifies member variables a and b', 'C) Cannot return *this from a const member function by value', 'D) Initializer list order must match declaration order of a and b']);

  add('mcq', 'Find the bug:\n\nclass Val {\n  int x;\npublic:\n  Val(int v) : x(v) {}\n  Val& set(int v) { x = v; }\n  void show() { cout << x; }\n};', 'A) set() promises to return Val& but has no return statement', ['A) set() promises to return Val& but has no return statement', 'B) set() modifies private x — needs friend access to work', 'C) Initializer list reuses parameter name v — shadows member', 'D) set() should return void since it modifies the object in place']);

  add('mcq', 'What is wrong?\n\nclass Base {\npublic:\n  int x;\n  Base(int v) : x(v) {}\n  Base operator+(const Base& b) { return Base(x + b.x); }\n};\nclass Der : public Base {\n  int y;\npublic:\n  Der(int a, int b) : Base(a), y(b) {}\n  int getY() { return y; }\n};\nint main() {\n  Der a(1, 2), b(3, 4);\n  Der c = a + b;\n}', 'C) operator+ returns Base not Der — cannot assign Base to Der', ['A) operator+ should return Base& to avoid creating temporaries', 'B) Der inherits operator+ but it is not accessible from Der objects', 'C) operator+ returns Base not Der — cannot assign Base to Der', 'D) Der constructor list Base(a), y(b) has mismatched parameter names']);

  add('mcq', 'What is the bug?\n\nclass A {\npublic:\n  int* data;\n  A(int v) { data = new int(v); }\n};\nclass B : public A {\npublic:\n  B(int v) : A(v) {}\n};\nint main() {\n  B b(5);\n}', 'B) Neither A nor B has a destructor — data is never deleted', ['A) B must explicitly delete data since A has no virtual destructor', 'B) Neither A nor B has a destructor — data is never deleted', 'C) new int(v) allocates a single int — should use new int[v] for array', 'D) data is public so external code may accidentally double-delete it']);

  add('mcq', 'Spot the issue:\n\nclass Config {\n  Config() {}\n  Config(const Config&) {}\npublic:\n  static Config& instance() {\n    Config c;\n    return c;\n  }\n};', 'A) Returning reference to local variable — undefined behavior', ['A) Returning reference to local variable — undefined behavior', 'B) Private constructor prevents static method from creating Config c', 'C) Config c should be allocated with new for proper Singleton lifetime', 'D) instance() should return Config* not Config& for Singleton pattern']);

  add('mcq', 'What is wrong?\n\nclass A {\npublic:\n  virtual void show() { cout << "A"; }\n};\nclass B : public A {\npublic:\n  void show(int x) { cout << "B" << x; }\n};\nint main() {\n  B b;\n  b.show();\n}', 'B) B::show(int) hides A::show() — no-arg call fails to compile', ['A) B::show(int) should be marked override to replace A::show()', 'B) B::show(int) hides A::show() — no-arg call fails to compile', 'C) Virtual functions cannot have different parameters in derived class', 'D) B inherits show() and adds show(int) — the call is ambiguous']);

  add('mcq', 'What is wrong?\n\nclass A {\npublic:\n  virtual void greet() { cout << "A"; }\n  ~A() {}\n};\nclass B : public A {\n  int* data;\npublic:\n  B() { data = new int(5); }\n  void greet() { cout << "B"; }\n  ~B() { delete data; }\n};\nvoid test(A* p) {\n  p->greet();\n  delete p;\n}\nint main() { test(new B()); }', 'B) ~A() is not virtual — deleting through base pointer skips ~B()', ['A) B::greet() needs the override keyword to properly replace A::greet()', 'B) ~A() is not virtual — deleting through base pointer skips ~B()', 'C) new B() cannot be implicitly converted to A* without explicit cast', 'D) greet() should be pure virtual for polymorphic deletion to work']);

  add('mcq', 'Spot the lifetime bug:\n\nclass Wrapper {\n  string& ref;\npublic:\n  Wrapper(string& s) : ref(s) {}\n  void print() { cout << ref; }\n};\nWrapper makeWrap() {\n  string local = "hello";\n  return Wrapper(local);\n}\nint main() {\n  auto w = makeWrap();\n  w.print();\n}', 'B) ref holds reference to local — dangling after function returns', ['A) Wrapper needs a copy constructor since it holds a reference member', 'B) ref holds reference to local — dangling after function returns', 'C) auto w cannot deduce the return type — must specify Wrapper explicitly', 'D) string& ref should be const string& ref to accept local variables']);

  add('mcq', 'Spot the issue:\n\nclass Buffer {\n  int* arr;\n  int size;\npublic:\n  Buffer(int n) : size(n) { arr = new int[n]; }\n  ~Buffer() { delete[] arr; }\n  void fill(int v) { for(int i=0;i<=size;i++) arr[i]=v; }\n};\nint main() {\n  Buffer b(5);\n  b.fill(1);\n}', 'A) fill() uses i<=size — writes one past the array bounds', ['A) fill() uses i<=size — writes one past the array bounds', 'B) Constructor should allocate new int[n+1] to match the loop bounds', 'C) delete[] should be delete since arr is a single contiguous block', 'D) size must be const since it should not change after construction']);

  add('mcq', 'What is the bug?\n\nclass Str {\n  char* buf;\n  int len;\npublic:\n  Str(const char* s) : len(strlen(s)) {\n    buf = new char[len];\n    strcpy(buf, s);\n  }\n  ~Str() { delete[] buf; }\n};', 'A) buf needs len+1 bytes for the null terminator', ['A) buf needs len+1 bytes for the null terminator', 'B) strcpy does not copy the null terminator — needs manual append', 'C) strlen counts the null character — len is already one too large', 'D) delete[] should be free() to match C-style string allocation']);

  add('mcq', 'What is wrong?\n\nclass Stack {\n  int* data;\n  int top;\npublic:\n  Stack(int n) { data = new int[n]; top = 0; }\n  void push(int v) { data[top] = v; top++; }\n  int pop() { return data[top--]; }\n  ~Stack() { delete[] data; }\n};', 'B) pop() returns data[top] then decrements — reads wrong slot', ['A) push() should assign after incrementing top — skips index 0', 'B) pop() returns data[top] then decrements — reads wrong slot', 'C) pop() should use top++ instead of top-- to advance forward', 'D) push() and pop() have an off-by-one — stack holds one less element']);

  add('mcq', 'Find the subtle bug:\n\nclass A {\npublic:\n  int x = 1;\n  A& setX(int v) { x = v; return *this; }\n};\nclass B : public A {\npublic:\n  int y = 2;\n  B& setY(int v) { y = v; return *this; }\n};\nint main() {\n  B b;\n  b.setX(10).setY(20);\n}', 'C) setX returns A& not B& — calling setY on A& fails to compile', ['A) B cannot call setX() because it is not a virtual function in A', 'B) setX() in A automatically returns B& when called on B objects', 'C) setX returns A& not B& — calling setY on A& fails to compile', 'D) Method chaining with inheritance requires covariant return types']);

  add('mcq', 'What is wrong?\n\nstruct Link {\n  int v;\n  Link* next;\n  Link(int x) : v(x), next(nullptr) {}\n  ~Link() { delete next; }\n};\nint main() {\n  Link* a = new Link(1);\n  a->next = new Link(2);\n  a->next->next = a;\n  delete a;\n}', 'B) Circular reference — delete a triggers infinite recursive deletion', ['A) a->next->next = a creates a cycle — this is a compile error', 'B) Circular reference — delete a triggers infinite recursive deletion', 'C) Link destructor should check for nullptr before calling delete', 'D) Setting next->next to an already-allocated node corrupts the heap']);

  add('mcq', 'Spot the issue:\n\nclass Matrix {\n  int** data;\n  int rows, cols;\npublic:\n  Matrix(int r, int c) : rows(r), cols(c) {\n    data = new int*[rows];\n    for(int i = 0; i < rows; i++)\n      data[i] = new int[cols];\n  }\n  ~Matrix() { delete[] data; }\n};', 'C) Destructor only deletes the pointer array — each row leaks', ['A) delete[] data correctly frees all memory including each row', 'B) Constructor should allocate a single new int[rows*cols] block instead', 'C) Destructor only deletes the pointer array — each row leaks', 'D) Should use delete data instead of delete[] for pointer-to-pointer']);

  add('mcq', 'What is the issue?\n\nclass Vec {\n  int* arr;\n  int sz;\npublic:\n  Vec(int n) : sz(n), arr(new int[n]) {}\n  Vec& operator=(const Vec& o) {\n    delete[] arr;\n    sz = o.sz;\n    arr = new int[sz];\n    for(int i = 0; i < sz; i++) arr[i] = o.arr[i];\n    return *this;\n  }\n  ~Vec() { delete[] arr; }\n};', 'A) Self-assignment crashes — deletes arr before copying from it', ['A) Self-assignment crashes — deletes arr before copying from it', 'B) operator= should return void to prevent chained assignments', 'C) Initialization order of sz and arr differs from declaration order', 'D) Loop copies elements in wrong order — should iterate backwards']);

  add('mcq', 'What is wrong?\n\nclass Node {\npublic:\n  int val;\n  Node* left;\n  Node* right;\n  Node(int v) : val(v), left(nullptr), right(nullptr) {}\n  ~Node() {\n    delete left;\n    delete right;\n  }\n};\nint main() {\n  Node* a = new Node(1);\n  Node* b = new Node(2);\n  a->left = b;\n  a->right = b;\n  delete a;\n}', 'A) b is shared between left and right — deleting a frees b twice', ['A) b is shared between left and right — deleting a frees b twice', 'B) Destructor deletes left and right recursively — causes stack overflow', 'C) Cannot assign same pointer to both left and right — compile error', 'D) Destructor should only delete left — right is handled separately']);

  add('mcq', 'What is wrong?\n\nclass List {\n  int* data;\n  int cap, sz;\npublic:\n  List() : cap(4), sz(0), data(new int[4]) {}\n  void add(int v) {\n    if(sz == cap) {\n      cap *= 2;\n      int* tmp = new int[cap];\n      for(int i = 0; i < sz; i++) tmp[i] = data[i];\n      data = tmp;\n    }\n    data[sz++] = v;\n  }\n  ~List() { delete[] data; }\n};', 'C) Old data array is never freed on resize — memory leaks', ['A) cap *= 2 may overflow — should check max size before doubling', 'B) Loop only copies sz elements — the new element being added is lost', 'C) Old data array is never freed on resize — memory leaks', 'D) data = tmp reassigns a local copy — original data pointer unchanged']);

  add('mcq', 'Spot the bug:\n\nclass Cache {\n  map<string, int*> store;\npublic:\n  void put(string key, int val) {\n    store[key] = new int(val);\n  }\n  ~Cache() {\n    for(auto& p : store) delete p.second;\n  }\n};', 'A) put() doesn\'t delete old value if key exists — repeated puts leak', ['A) put() doesn\'t delete old value if key exists — repeated puts leak', 'B) Destructor should use delete[] for dynamically allocated integers', 'C) map operator[] default-constructs a nullptr — undefined behavior', 'D) Range-for with auto& does not correctly iterate map pairs']);

  // ═══════════════════════════════════════════════════════════════

  await adminService.seedQuestionsForLevel(level, questions);
  console.log('Level 8 seeded with ' + questions.length + ' questions (60 oneword + 25 MCQ)!');
  await app.close();
}

bootstrap().catch(console.error);
