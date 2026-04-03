import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { AdminService } from '../admin/admin.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const adminService = app.get(AdminService);

  const questions: any[] = [];
  const level = 6;
  let questionId = 601;

  const add = (type: string, text: string, answer: string, opts?: string[]) => {
    questions.push({ id: questionId++, level, roundKey: 'round1', type, text, correct: answer, options: opts || null, isActive: true });
  };

  // LEVEL 6 — Output Prediction: Single & dual class, constructors/destructors, virtual dispatch
  // Medium difficulty — students should know inheritance and virtual, now trace carefully

  add('mcq', 'What is the output?\n\nclass A {\npublic:\n  A() { cout << "A"; }\n  ~A() { cout << "a"; }\n};\nint main() {\n  A x;\n  A y;\n}', 'B) AAaa', ['A) AaAa', 'B) AAaa', 'C) Aa', 'D) AA']);
  add('mcq', 'What is the output?\n\nclass A {\npublic:\n  A() { cout << "1"; }\n  ~A() { cout << "2"; }\n};\nclass B : public A {\npublic:\n  B() { cout << "3"; }\n  ~B() { cout << "4"; }\n};\nint main() { B b; }', 'B) 1342', ['A) 3142', 'B) 1342', 'C) 1234', 'D) 4321']);
  add('mcq', 'What is the output?\n\nclass X {\n  int v;\npublic:\n  X(int a) : v(a) {}\n  void show() { cout << v; }\n};\nint main() {\n  X a(5);\n  X b = a;\n  b.show();\n}', 'A) 5', ['A) 5', 'B) 0', 'C) Garbage', 'D) Compiler error']);
  add('mcq', 'What is the output?\n\nclass A {\npublic:\n  virtual void f() { cout << "A"; }\n};\nclass B : public A {\npublic:\n  void f() { cout << "B"; }\n};\nint main() {\n  A* p = new B();\n  p->f();\n  delete p;\n}', 'B) B', ['A) A', 'B) B', 'C) AB', 'D) BA']);
  add('mcq', 'What is the output?\n\nclass A {\npublic:\n  void f() { cout << "A"; }\n};\nclass B : public A {\npublic:\n  void f() { cout << "B"; }\n};\nint main() {\n  A* p = new B();\n  p->f();\n}', 'A) A', ['A) A', 'B) B', 'C) Compiler error', 'D) AB']);
  add('mcq', 'What is the output?\n\nclass Num {\n  int x;\npublic:\n  Num(int v) : x(v) {}\n  Num operator+(Num n) { return Num(x + n.x); }\n  void print() { cout << x; }\n};\nint main() {\n  Num a(4), b(6);\n  Num c = a + b;\n  c.print();\n}', 'C) 10', ['A) 4', 'B) 6', 'C) 10', 'D) Compiler error']);
  add('mcq', 'What is the output?\n\nclass Dog {\npublic:\n  static int count;\n  Dog() { count++; }\n};\nint Dog::count = 0;\nint main() {\n  Dog a, b, c, d;\n  cout << Dog::count;\n}', 'D) 4', ['A) 0', 'B) 1', 'C) 3', 'D) 4']);
  add('mcq', 'What is the output?\n\nclass A {\npublic:\n  A() { cout << "A"; }\n  ~A() { cout << "~A"; }\n};\nint main() {\n  A* p = new A();\n  delete p;\n}', 'B) A~A', ['A) A', 'B) A~A', 'C) ~A', 'D) Nothing']);
  add('mcq', 'What is the output?\n\nvoid show(int x) { cout << "int"; }\nvoid show(double x) { cout << "double"; }\nint main() {\n  show(3.14);\n}', 'B) double', ['A) int', 'B) double', 'C) Compiler error', 'D) 3.14']);
  add('mcq', 'What is the output?\n\nclass A {\npublic:\n  int x;\n  A(int v) : x(v) {}\n};\nclass B : public A {\npublic:\n  B(int v) : A(v) {}\n  void show() { cout << x; }\n};\nint main() {\n  B b(7);\n  b.show();\n}', 'C) 7', ['A) 0', 'B) Compiler error', 'C) 7', 'D) Garbage']);

  add('mcq', 'What is the output?\n\nclass A {\npublic:\n  virtual void go() { cout << "A"; }\n  virtual ~A() {}\n};\nclass B : public A {\npublic:\n  void go() { cout << "B"; }\n};\nclass C : public B {\npublic:\n  void go() { cout << "C"; }\n};\nint main() {\n  A* p = new C();\n  p->go();\n}', 'C) C', ['A) A', 'B) B', 'C) C', 'D) ABC']);
  add('mcq', 'What is the output?\n\nclass P {\npublic:\n  P() { cout << "P"; }\n  ~P() { cout << "~P"; }\n};\nclass Q : public P {\npublic:\n  Q() { cout << "Q"; }\n  ~Q() { cout << "~Q"; }\n};\nint main() {\n  Q q;\n}', 'B) PQ~Q~P', ['A) QP~P~Q', 'B) PQ~Q~P', 'C) PQ~P~Q', 'D) QP~Q~P']);
  add('mcq', 'What is the output?\n\nclass T {\n  int a, b;\npublic:\n  T(int x, int y) : a(x), b(y) {}\n  int sum() { return a + b; }\n};\nint main() {\n  T t(3, 8);\n  cout << t.sum();\n}', 'A) 11', ['A) 11', 'B) 3', 'C) 8', 'D) Compiler error']);
  add('mcq', 'What is the output?\n\nclass A {\npublic:\n  void print() const { cout << "const"; }\n  void print() { cout << "non-const"; }\n};\nint main() {\n  const A a;\n  a.print();\n}', 'A) const', ['A) const', 'B) non-const', 'C) Compiler error', 'D) constconst']);
  add('mcq', 'What is the output?\n\nclass Num {\npublic:\n  int v;\n  Num(int x) : v(x) {}\n  bool operator==(Num n) { return v == n.v; }\n};\nint main() {\n  Num a(5), b(5);\n  cout << (a == b ? "yes" : "no");\n}', 'B) yes', ['A) no', 'B) yes', 'C) 1', 'D) Compiler error']);

  add('mcq', 'What is the output?\n\nclass Box {\n  int *data;\npublic:\n  Box(int v) { data = new int(v); }\n  ~Box() { delete data; }\n  void show() { cout << *data; }\n};\nint main() {\n  Box b(9);\n  b.show();\n}', 'A) 9', ['A) 9', 'B) 0', 'C) Garbage', 'D) Crash']);
  add('mcq', 'What is the output?\n\nclass Base {\npublic:\n  Base() { cout << "B"; }\n  virtual ~Base() { cout << "~B"; }\n};\nclass Der : public Base {\npublic:\n  Der() { cout << "D"; }\n  ~Der() { cout << "~D"; }\n};\nint main() {\n  Base* p = new Der();\n  delete p;\n}', 'B) BD~D~B', ['A) BD~B', 'B) BD~D~B', 'C) BD~B~D', 'D) DB~D~B']);
  add('mcq', 'What is the output?\n\nclass A {\n  int x;\npublic:\n  A() : x(10) {}\n  int getX() { return x; }\n};\nint main() {\n  A a;\n  cout << a.getX();\n}', 'C) 10', ['A) 0', 'B) Garbage', 'C) 10', 'D) Compiler error']);
  add('mcq', 'What is the output?\n\nclass Msg {\npublic:\n  void say(string s) { cout << s; }\n  void say(int n) { cout << n * 2; }\n};\nint main() {\n  Msg m;\n  m.say(5);\n}', 'B) 10', ['A) 5', 'B) 10', 'C) Compiler error', 'D) string']);
  add('mcq', 'What is the output?\n\nclass Vehicle {\npublic:\n  virtual string type() { return "Vehicle"; }\n};\nclass Car : public Vehicle {\npublic:\n  string type() { return "Car"; }\n};\nint main() {\n  Vehicle* v = new Car();\n  cout << v->type();\n}', 'B) Car', ['A) Vehicle', 'B) Car', 'C) VehicleCar', 'D) Compiler error']);

  add('mcq', 'What is the output?\n\nclass A {\npublic:\n  static int x;\n  A() { x++; }\n};\nint A::x = 5;\nint main() {\n  A a, b;\n  cout << A::x;\n}', 'C) 7', ['A) 2', 'B) 5', 'C) 7', 'D) 0']);
  add('mcq', 'What is the output?\n\nclass Shape {\npublic:\n  virtual double area() { return 0; }\n};\nclass Circle : public Shape {\n  double r;\npublic:\n  Circle(double x) : r(x) {}\n  double area() { return r * r; }\n};\nint main() {\n  Shape* s = new Circle(3);\n  cout << s->area();\n}', 'A) 9', ['A) 9', 'B) 0', 'C) 3', 'D) Compiler error']);
  add('mcq', 'What is the output?\n\nclass A {\npublic:\n  int v = 42;\n};\nclass B : public A {};\nint main() {\n  B b;\n  cout << b.v;\n}', 'B) 42', ['A) 0', 'B) 42', 'C) Compiler error', 'D) Garbage']);
  add('mcq', 'What is the output?\n\nint main() {\n  int* p = new int(100);\n  int* q = p;\n  *q = 200;\n  cout << *p;\n  delete p;\n}', 'A) 200', ['A) 200', 'B) 100', 'C) Garbage', 'D) Crash']);
  add('mcq', 'What is the output?\n\nclass Score {\n  int s;\npublic:\n  Score(int x) : s(x) {}\n  Score operator+(Score b) { return Score(s + b.s); }\n  void print() { cout << s; }\n};\nint main() {\n  Score a(10), b(20), c(30);\n  Score total = a + b + c;\n  total.print();\n}', 'C) 60', ['A) 10', 'B) 30', 'C) 60', 'D) Compiler error']);

  add('mcq', 'What is the output?\n\nclass Animal {\npublic:\n  virtual void sound() { cout << "..."; }\n};\nclass Dog : public Animal {\npublic:\n  void sound() { cout << "Woof"; }\n};\nclass Cat : public Animal {\npublic:\n  void sound() { cout << "Meow"; }\n};\nint main() {\n  Animal* a[2] = { new Dog(), new Cat() };\n  for (int i=0; i<2; i++) a[i]->sound();\n}', 'A) WoofMeow', ['A) WoofMeow', 'B) ......', 'C) MeowWoof', 'D) Compiler error']);
  add('mcq', 'What is the output?\n\nclass R {\n  int x;\npublic:\n  R(int v) : x(v) {}\n  R(const R& o) : x(o.x + 1) {}\n  void show() { cout << x; }\n};\nint main() {\n  R a(5);\n  R b = a;\n  b.show();\n}', 'B) 6', ['A) 5', 'B) 6', 'C) 0', 'D) Compiler error']);
  add('mcq', 'What is the output?\n\nclass A {\npublic:\n  virtual void show() { cout << "A"; }\n};\nclass B : public A {\npublic:\n  virtual void show() { cout << "B"; }\n};\nint main() {\n  B b;\n  A& ref = b;\n  ref.show();\n}', 'B) B', ['A) A', 'B) B', 'C) AB', 'D) Compiler error']);
  add('mcq', 'What is the output?\n\nclass C {\npublic:\n  int x;\n  C(int v) : x(v) {}\n  friend int getX(C c) { return c.x; }\n};\nint main() {\n  C obj(99);\n  cout << getX(obj);\n}', 'A) 99', ['A) 99', 'B) 0', 'C) Compiler error', 'D) Garbage']);
  add('mcq', 'What is the output?\n\nclass A {\npublic:\n  A() { cout << "A"; }\n};\nclass B {\npublic:\n  A a;\n  B() { cout << "B"; }\n};\nint main() {\n  B b;\n}', 'B) AB', ['A) BA', 'B) AB', 'C) B', 'D) A']);

  add('mcq', 'What is the output?\n\nclass X {\npublic:\n  X() { cout << "X"; }\n  X(const X& o) { cout << "C"; }\n};\nvoid f(X x) { cout << "f"; }\nint main() {\n  X a;\n  f(a);\n}', 'B) XCf', ['A) Xf', 'B) XCf', 'C) XCCf', 'D) fX']);
  add('mcq', 'What is the output?\n\nclass A {\npublic:\n  virtual void f() { cout << "A"; }\n  ~A() { cout << "~A"; }\n};\nclass B : public A {\npublic:\n  void f() { cout << "B"; }\n  ~B() { cout << "~B"; }\n};\nint main() {\n  A* p = new B();\n  p->f();\n  delete p;\n}', 'B) B~A', ['A) B~B~A', 'B) B~A', 'C) A~A', 'D) B~B']);
  add('mcq', 'What is the output?\n\nclass M {\n  int x, y;\npublic:\n  M(int a, int b) : x(a), y(b) {}\n  int max() { return x > y ? x : y; }\n};\nint main() {\n  M m(7, 3);\n  cout << m.max();\n}', 'A) 7', ['A) 7', 'B) 3', 'C) 10', 'D) Compiler error']);
  add('mcq', 'What is the output?\n\nclass A {\npublic:\n  virtual void f() = 0;\n};\nclass B : public A {\npublic:\n  void f() { cout << "B"; }\n};\nint main() {\n  A* p = new B();\n  p->f();\n}', 'B) B', ['A) A', 'B) B', 'C) Compiler error — A is abstract', 'D) Nothing']);
  add('mcq', 'What is the output?\n\nclass Node {\npublic:\n  int v;\n  Node* next;\n  Node(int x) : v(x), next(nullptr) {}\n};\nint main() {\n  Node n(5);\n  cout << n.v;\n}', 'A) 5', ['A) 5', 'B) 0', 'C) nullptr', 'D) Compiler error']);

  add('mcq', 'What is the output?\n\nclass Stack {\n  int data[3];\n  int top;\npublic:\n  Stack() : top(-1) {}\n  void push(int v) { data[++top] = v; }\n  int pop() { return data[top--]; }\n};\nint main() {\n  Stack s;\n  s.push(1); s.push(2); s.push(3);\n  cout << s.pop();\n}', 'C) 3', ['A) 1', 'B) 2', 'C) 3', 'D) Compiler error']);
  add('mcq', 'What is the output?\n\nclass A {\npublic:\n  int x = 10;\n};\nclass B : public A {\npublic:\n  int x = 20;\n  void show() { cout << A::x << B::x; }\n};\nint main() {\n  B b;\n  b.show();\n}', 'A) 1020', ['A) 1020', 'B) 2010', 'C) 20', 'D) 10']);
  add('mcq', 'What is the output?\n\nclass W {\npublic:\n  W() { cout << "W"; }\n  W(const W&) { cout << "CW"; }\n  W& operator=(const W&) { cout << "=W"; return *this; }\n};\nint main() {\n  W a;\n  W b;\n  b = a;\n}', 'B) WW=W', ['A) WWCW', 'B) WW=W', 'C) W=W', 'D) CW=W']);
  add('mcq', 'What is the output?\n\nclass A {\n  int x;\npublic:\n  A(int v) : x(v) {}\n  void show() { cout << x; }\n};\nint main() {\n  A arr[3] = {A(1), A(2), A(3)};\n  arr[1].show();\n}', 'B) 2', ['A) 1', 'B) 2', 'C) 3', 'D) Compiler error']);
  add('mcq', 'What is the output?\n\nclass A {\npublic:\n  virtual string name() { return "A"; }\n};\nclass B : public A {\npublic:\n  string name() { return "B"; }\n};\nstring greet(A& obj) {\n  return "Hi " + obj.name();\n}\nint main() {\n  B b;\n  cout << greet(b);\n}', 'B) Hi B', ['A) Hi A', 'B) Hi B', 'C) HiB', 'D) Compiler error']);
  add('mcq', 'What is the output?\n\nclass Counter {\n  int n;\npublic:\n  Counter() : n(0) {}\n  Counter& operator++() { ++n; return *this; }\n  void show() { cout << n; }\n};\nint main() {\n  Counter c;\n  ++c;\n  ++c;\n  ++c;\n  c.show();\n}', 'C) 3', ['A) 0', 'B) 1', 'C) 3', 'D) Compiler error']);

  add('mcq', 'What is the output?\n\nclass A {\npublic:\n  A() { cout << "A1"; }\n  A(int) { cout << "A2"; }\n};\nclass B : public A {\npublic:\n  B() : A(5) { cout << "B"; }\n};\nint main() {\n  B b;\n}', 'B) A2B', ['A) A1B', 'B) A2B', 'C) BA2', 'D) BA1']);
  add('mcq', 'What is the output?\n\nclass T {\npublic:\n  T() { cout << "T"; }\n  ~T() { cout << "t"; }\n};\nint main() {\n  {\n    T a;\n    T b;\n  }\n  cout << "done";\n}', 'A) TTttdone', ['A) TTttdone', 'B) TTdone', 'C) ttTTdone', 'D) Ttdone']);
  add('mcq', 'What is the output?\n\nclass A {\npublic:\n  void show() { cout << "A"; }\n};\nclass B : public A {\npublic:\n  void show() { cout << "B"; }\n};\nvoid call(A obj) { obj.show(); }\nint main() {\n  B b;\n  call(b);\n}', 'A) A', ['A) A', 'B) B', 'C) AB', 'D) Compiler error']);
  add('mcq', 'What is the output?\n\nclass X {\npublic:\n  int v;\n  X(int a) : v(a) {}\n  bool operator<(X& o) { return v < o.v; }\n};\nint main() {\n  X a(3), b(7);\n  cout << (a < b ? "yes" : "no");\n}', 'B) yes', ['A) no', 'B) yes', 'C) 1', 'D) Compiler error']);
  add('mcq', 'What is the output?\n\nclass Base {\npublic:\n  int x = 1;\n};\nclass Mid : public Base {\npublic:\n  int x = 2;\n};\nclass Der : public Mid {\npublic:\n  void show() { cout << x; }\n};\nint main() {\n  Der d;\n  d.show();\n}', 'B) 2', ['A) 1', 'B) 2', 'C) 12', 'D) Compiler error']);

  add('mcq', 'What is the output?\n\nclass A {\npublic:\n  void f() { cout << "A::f"; }\n};\nclass B : public A {\npublic:\n  void f() { A::f(); cout << "+B::f"; }\n};\nint main() {\n  B b;\n  b.f();\n}', 'C) A::f+B::f', ['A) B::f', 'B) A::f', 'C) A::f+B::f', 'D) Compiler error']);
  add('mcq', 'What is the output?\n\nclass Pair {\n  int a, b;\npublic:\n  Pair(int x, int y) : a(x), b(y) {}\n  void swap() { int t = a; a = b; b = t; }\n  void show() { cout << a << b; }\n};\nint main() {\n  Pair p(3, 7);\n  p.swap();\n  p.show();\n}', 'A) 73', ['A) 73', 'B) 37', 'C) 710', 'D) Compiler error']);
  add('mcq', 'What is the output?\n\nclass A {\n  int x;\npublic:\n  A(int v) : x(v) {}\n  int get() const { return x; }\n};\nvoid print(const A& a) { cout << a.get(); }\nint main() {\n  A a(42);\n  print(a);\n}', 'B) 42', ['A) 0', 'B) 42', 'C) Compiler error', 'D) Garbage']);
  add('mcq', 'What is the output?\n\nclass Arr {\n  int data[5];\npublic:\n  Arr() { for(int i=0;i<5;i++) data[i]=i*i; }\n  int get(int i) { return data[i]; }\n};\nint main() {\n  Arr a;\n  cout << a.get(3);\n}', 'C) 9', ['A) 3', 'B) 6', 'C) 9', 'D) 16']);
  add('mcq', 'What is the output?\n\nclass A {\npublic:\n  virtual void show() { cout << "A"; }\n  virtual ~A() {}\n};\nclass B : public A {\n  A inner;\npublic:\n  void show() { inner.show(); cout << "B"; }\n};\nint main() {\n  B b;\n  b.show();\n}', 'A) AB', ['A) AB', 'B) BA', 'C) B', 'D) Compiler error']);

  // --- Additional Questions (14 more to reach 65) ---

  // Multiple inheritance constructor order
  add('mcq', 'What is the output?\n\nclass A {\npublic:\n  A() { cout << "A"; }\n};\nclass B {\npublic:\n  B() { cout << "B"; }\n};\nclass C : public A, public B {\n  A a;\npublic:\n  C() { cout << "C"; }\n};\nint main() { C c; }', 'B) ABAC', ['A) ABCA', 'B) ABAC', 'C) CAAB', 'D) AABC']);

  // Pointer to derived, calling non-virtual
  add('mcq', 'What is the output?\n\nclass Base {\npublic:\n  void greet() { cout << "Hello"; }\n  virtual void talk() { cout << "Base"; }\n};\nclass Der : public Base {\npublic:\n  void greet() { cout << "Hi"; }\n  void talk() { cout << "Der"; }\n};\nint main() {\n  Base* p = new Der();\n  p->greet();\n  p->talk();\n}', 'C) HelloDer', ['A) HiDer', 'B) HelloBase', 'C) HelloDer', 'D) HiBase']);

  // Static method & object counting with destruction
  add('mcq', 'What is the output?\n\nclass Obj {\npublic:\n  static int alive;\n  Obj() { alive++; cout << "+"; }\n  ~Obj() { alive--; cout << "-"; }\n};\nint Obj::alive = 0;\nint main() {\n  Obj a;\n  {\n    Obj b;\n    Obj c;\n  }\n  cout << Obj::alive;\n}', 'A) +++-+-1', ['A) +++-+-1', 'B) +++--1', 'C) +++--2', 'D) +++-+-0']);

  // Copy constructor chain
  add('mcq', 'What is the output?\n\nclass A {\npublic:\n  int x;\n  A(int v) : x(v) { cout << "N"; }\n  A(const A& o) : x(o.x * 2) { cout << "C"; }\n};\nint main() {\n  A a(3);\n  A b = a;\n  A c = b;\n  cout << c.x;\n}', 'B) NCC12', ['A) NCC6', 'B) NCC12', 'C) NNN12', 'D) NCC3']);

  // Virtual function + base call inside override
  add('mcq', 'What is the output?\n\nclass A {\npublic:\n  virtual void f() { cout << "1"; }\n};\nclass B : public A {\npublic:\n  void f() { A::f(); cout << "2"; }\n};\nclass C : public B {\npublic:\n  void f() { B::f(); cout << "3"; }\n};\nint main() {\n  A* p = new C();\n  p->f();\n}', 'C) 123', ['A) 1', 'B) 3', 'C) 123', 'D) 321']);

  // Pre-increment vs post-increment operator overload
  add('mcq', 'What is the output?\n\nclass Val {\n  int n;\npublic:\n  Val(int v) : n(v) {}\n  Val& operator++() { n += 2; return *this; }\n  Val operator++(int) { Val t = *this; n += 3; return t; }\n  void show() { cout << n; }\n};\nint main() {\n  Val v(10);\n  (v++).show();\n  (++v).show();\n}', 'A) 1015', ['A) 1015', 'B) 1315', 'C) 1213', 'D) 1012']);

  // Const vs non-const method dispatch
  add('mcq', 'What is the output?\n\nclass Logger {\npublic:\n  void log() { cout << "W"; }\n  void log() const { cout << "R"; }\n};\nint main() {\n  Logger a;\n  const Logger b;\n  a.log();\n  b.log();\n}', 'B) WR', ['A) WW', 'B) WR', 'C) RR', 'D) Compiler error']);

  // Nested scope destruction interleaved with output
  add('mcq', 'What is the output?\n\nclass Tag {\n  char c;\npublic:\n  Tag(char ch) : c(ch) { cout << c; }\n  ~Tag() { cout << (char)(c+32); }\n};\nint main() {\n  Tag a(\'A\');\n  {\n    Tag b(\'B\');\n    Tag c(\'C\');\n  }\n  Tag d(\'D\');\n}', 'C) ABCcbDda', ['A) ABCDdcba', 'B) ABCcbDda', 'C) ABCcbDda', 'D) ABCDdacb']);

  // Method hiding with different parameter
  add('mcq', 'What is the output?\n\nclass A {\npublic:\n  void print() { cout << "A0"; }\n  void print(int x) { cout << "A" << x; }\n};\nclass B : public A {\npublic:\n  void print(int x) { cout << "B" << x; }\n};\nint main() {\n  B b;\n  b.print(5);\n  b.A::print();\n}', 'A) B5A0', ['A) B5A0', 'B) A5A0', 'C) B5', 'D) Compiler error']);

  // Assignment vs copy construction
  add('mcq', 'What is the output?\n\nclass X {\npublic:\n  X() { cout << "D"; }\n  X(const X&) { cout << "C"; }\n  X& operator=(const X&) { cout << "="; return *this; }\n};\nint main() {\n  X a;\n  X b;\n  X c = a;\n  b = a;\n}', 'B) DDC=', ['A) DDCC', 'B) DDC=', 'C) DD=C', 'D) DCC=']);

  // Virtual function called from base constructor
  add('mcq', 'What is the output?\n\nclass Base {\npublic:\n  Base() { init(); }\n  virtual void init() { cout << "B"; }\n};\nclass Der : public Base {\npublic:\n  void init() { cout << "D"; }\n};\nint main() { Der d; }', 'A) B', ['A) B', 'B) D', 'C) BD', 'D) DB']);

  // Operator<< overload with friend
  add('mcq', 'What is the output?\n\nclass Point {\n  int x, y;\npublic:\n  Point(int a, int b) : x(a), y(b) {}\n  friend ostream& operator<<(ostream& os, const Point& p) {\n    os << "(" << p.x << "," << p.y << ")";\n    return os;\n  }\n};\nint main() {\n  Point p(3, 4);\n  cout << p;\n}', 'B) (3,4)', ['A) 3,4', 'B) (3,4)', 'C) Point(3,4)', 'D) Compiler error']);

  // Dynamic cast with polymorphic chain
  add('mcq', 'What is the output?\n\nclass A {\npublic:\n  virtual void f() { cout << "A"; }\n};\nclass B : public A {\npublic:\n  void f() { cout << "B"; }\n};\nint main() {\n  B obj;\n  A& ref = obj;\n  ref.f();\n  A copy = obj;\n  copy.f();\n}', 'C) BA', ['A) BB', 'B) AA', 'C) BA', 'D) AB']);

  // Complex member + inheritance construction order
  add('mcq', 'What is the output?\n\nclass Engine {\npublic:\n  Engine() { cout << "E"; }\n  ~Engine() { cout << "e"; }\n};\nclass Vehicle {\npublic:\n  Vehicle() { cout << "V"; }\n  ~Vehicle() { cout << "v"; }\n};\nclass Car : public Vehicle {\n  Engine eng;\npublic:\n  Car() { cout << "C"; }\n  ~Car() { cout << "c"; }\n};\nint main() { Car c; }', 'A) VECcev', ['A) VECcev', 'B) EVCcev', 'C) VCEecv', 'D) VECvec']);

  await adminService.seedQuestionsForLevel(level, questions);
  console.log('Level 6 seeded with 65 output prediction questions!');
  await app.close();
}

bootstrap().catch(console.error);
