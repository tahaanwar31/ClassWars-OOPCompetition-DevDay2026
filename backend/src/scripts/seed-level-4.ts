import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { AdminService } from '../admin/admin.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const adminService = app.get(AdminService);

  console.log('Seeding Level 4 (60 questions — output prediction)...');

  const questions = [];
  let id = 401;
  const add = (type: string, text: string, answer: string, opts?: string[]) => {
    questions.push({ id: id++, level: 4, roundKey: 'round1', type, text, correct: answer, options: opts || null, isActive: true });
  };

  // ═══════════════════════════════════════════
  // LEVEL 4 — Output Prediction (MCQ)
  // "What is the output?" — trace through code
  // Topics: constructor/destructor order, static, copy constructor,
  //         virtual functions, basic inheritance, scope, const
  // ═══════════════════════════════════════════

  // --- Constructor Order ---
  add('mcq', 'What is the output?\n\nclass A {\npublic:\n  A() { cout << "A"; }\n};\nclass B : public A {\npublic:\n  B() { cout << "B"; }\n};\nint main() { B b; }', 'A) AB', ['A) AB', 'B) BA', 'C) A', 'D) B']);

  add('mcq', 'What is the output?\n\nclass A {\npublic:\n  A() { cout << "1"; }\n};\nclass B {\npublic:\n  B() { cout << "2"; }\n};\nclass C : public A, public B {\npublic:\n  C() { cout << "3"; }\n};\nint main() { C c; }', 'B) 123', ['A) 321', 'B) 123', 'C) 213', 'D) 132']);

  add('mcq', 'What is the output?\n\nclass X {\npublic:\n  X() { cout << "X"; }\n};\nclass Y : public X {\npublic:\n  Y() { cout << "Y"; }\n};\nclass Z : public Y {\npublic:\n  Z() { cout << "Z"; }\n};\nint main() { Z z; }', 'C) XYZ', ['A) ZYX', 'B) Z', 'C) XYZ', 'D) XZ']);

  // --- Destructor Order ---
  add('mcq', 'What is the output?\n\nclass A {\npublic:\n  A() { cout << "A"; }\n  ~A() { cout << "a"; }\n};\nclass B : public A {\npublic:\n  B() { cout << "B"; }\n  ~B() { cout << "b"; }\n};\nint main() { B obj; }', 'A) ABba', ['A) ABba', 'B) ABab', 'C) BAba', 'D) BAab']);

  add('mcq', 'What is the output?\n\nclass P {\npublic:\n  P() { cout << "P"; }\n  ~P() { cout << "p"; }\n};\nclass Q : public P {\npublic:\n  Q() { cout << "Q"; }\n  ~Q() { cout << "q"; }\n};\nclass R : public Q {\npublic:\n  R() { cout << "R"; }\n  ~R() { cout << "r"; }\n};\nint main() { R r; }', 'B) PQRrqp', ['A) PQRpqr', 'B) PQRrqp', 'C) RQPpqr', 'D) RPQpqr']);

  // --- Copy Constructor ---
  add('mcq', 'What is the output?\n\nclass T {\npublic:\n  T() { cout << "C"; }\n  T(const T&) { cout << "K"; }\n};\nint main() {\n  T a;\n  T b = a;\n  T c(a);\n}', 'C) CKK', ['A) CCC', 'B) CK', 'C) CKK', 'D) KKK']);

  add('mcq', 'What is the output?\n\nclass Box {\npublic:\n  Box() { cout << "N"; }\n  Box(const Box&) { cout << "C"; }\n};\nvoid f(Box b) {}\nint main() {\n  Box x;\n  f(x);\n}', 'B) NC', ['A) NN', 'B) NC', 'C) CN', 'D) CC']);

  add('mcq', 'What is the output?\n\nclass M {\npublic:\n  M() { cout << "1"; }\n  M(const M&) { cout << "2"; }\n};\nM getM() {\n  M m;\n  return m;\n}\nint main() { M a = getM(); }', 'A) 1', ['A) 1', 'B) 12', 'C) 122', 'D) 11']);

  // --- Static Members ---
  add('mcq', 'What is the output?\n\nclass Counter {\n  static int n;\npublic:\n  Counter() { n++; }\n  static int get() { return n; }\n};\nint Counter::n = 0;\nint main() {\n  Counter a, b, c, d;\n  cout << Counter::get();\n}', 'D) 4', ['A) 1', 'B) 2', 'C) 3', 'D) 4']);

  add('mcq', 'What is the output?\n\nclass S {\npublic:\n  static int x;\n  S() { x++; }\n};\nint S::x = 10;\nint main() {\n  S a, b;\n  cout << S::x;\n}', 'C) 12', ['A) 10', 'B) 11', 'C) 12', 'D) 2']);

  add('mcq', 'What is the output?\n\nclass Val {\npublic:\n  static int count;\n  Val() { count++; }\n  ~Val() { count--; }\n};\nint Val::count = 0;\nint main() {\n  Val a;\n  {\n    Val b;\n    cout << Val::count;\n  }\n  cout << Val::count;\n}', 'B) 21', ['A) 22', 'B) 21', 'C) 12', 'D) 11']);

  // --- Virtual Functions / Polymorphism ---
  add('mcq', 'What is the output?\n\nclass Base {\npublic:\n  virtual void show() { cout << "B"; }\n};\nclass Der : public Base {\npublic:\n  void show() { cout << "D"; }\n};\nint main() {\n  Base* p = new Der();\n  p->show();\n}', 'B) D', ['A) B', 'B) D', 'C) BD', 'D) Compiler Error']);

  add('mcq', 'What is the output?\n\nclass Base {\npublic:\n  void show() { cout << "B"; }\n};\nclass Der : public Base {\npublic:\n  void show() { cout << "D"; }\n};\nint main() {\n  Base* p = new Der();\n  p->show();\n}', 'A) B', ['A) B', 'B) D', 'C) BD', 'D) Compiler Error']);

  add('mcq', 'What is the output?\n\nclass A {\npublic:\n  virtual void f() { cout << "A"; }\n};\nclass B : public A {\npublic:\n  void f() { cout << "B"; }\n};\nclass C : public B {\npublic:\n  void f() { cout << "C"; }\n};\nint main() {\n  A* p = new C();\n  p->f();\n}', 'C) C', ['A) A', 'B) B', 'C) C', 'D) ABC']);

  add('mcq', 'What is the output?\n\nclass X {\npublic:\n  virtual void greet() { cout << "Hello"; }\n};\nclass Y : public X {\npublic:\n  void greet() { cout << "Hi"; }\n};\nint main() {\n  X x;\n  Y y;\n  X& ref = y;\n  ref.greet();\n}', 'B) Hi', ['A) Hello', 'B) Hi', 'C) HelloHi', 'D) Compiler Error']);

  // --- Composition ---
  add('mcq', 'What is the output?\n\nclass Engine {\npublic:\n  Engine() { cout << "E"; }\n  ~Engine() { cout << "e"; }\n};\nclass Car {\n  Engine eng;\npublic:\n  Car() { cout << "C"; }\n  ~Car() { cout << "c"; }\n};\nint main() { Car c; }', 'A) ECce', ['A) ECce', 'B) CEec', 'C) CEce', 'D) ECec']);

  add('mcq', 'What is the output?\n\nclass Wheel {\npublic:\n  Wheel() { cout << "W"; }\n};\nclass Bike {\n  Wheel w1, w2;\npublic:\n  Bike() { cout << "B"; }\n};\nint main() { Bike b; }', 'C) WWB', ['A) BWW', 'B) WBW', 'C) WWB', 'D) BW']);

  // --- Scope & Lifetime ---
  add('mcq', 'What is the output?\n\nclass T {\npublic:\n  T() { cout << "+"; }\n  ~T() { cout << "-"; }\n};\nint main() {\n  T a;\n  {\n    T b;\n  }\n  cout << "*";\n}', 'B) ++-*-', ['A) ++--*', 'B) ++-*-', 'C) ++*--', 'D) +-+-*']);

  add('mcq', 'What is the output?\n\nclass N {\n  int v;\npublic:\n  N(int x) : v(x) {}\n  int get() { return v; }\n};\nint main() {\n  N a(5);\n  N b(a);\n  cout << b.get();\n}', 'A) 5', ['A) 5', 'B) 0', 'C) Garbage', 'D) Compiler Error']);

  // --- Function calls ---
  add('mcq', 'What is the output?\n\nclass Num {\n  int x;\npublic:\n  Num(int v) : x(v) {}\n  Num add(Num n) { return Num(x + n.x); }\n  void print() { cout << x; }\n};\nint main() {\n  Num a(3), b(7);\n  Num c = a.add(b);\n  c.print();\n}', 'B) 10', ['A) 3', 'B) 10', 'C) 7', 'D) 0']);

  add('mcq', 'What is the output?\n\nclass A {\npublic:\n  int x;\n  A(int v) : x(v) {}\n};\nint main() {\n  A a(10);\n  A b = a;\n  b.x = 20;\n  cout << a.x << b.x;\n}', 'C) 1020', ['A) 2020', 'B) 1010', 'C) 1020', 'D) 2010']);

  // --- this pointer ---
  add('mcq', 'What is the output?\n\nclass Self {\n  int val;\npublic:\n  Self(int val) : val(val) {}\n  Self& add(int n) {\n    val += n;\n    return *this;\n  }\n  void show() { cout << val; }\n};\nint main() {\n  Self s(1);\n  s.add(2).add(3).show();\n}', 'A) 6', ['A) 6', 'B) 3', 'C) 1', 'D) Compiler Error']);

  add('mcq', 'What is the output?\n\nclass Item {\n  int x;\npublic:\n  Item(int x) { this->x = x; }\n  int getX() { return x; }\n};\nint main() {\n  Item i(42);\n  cout << i.getX();\n}', 'B) 42', ['A) 0', 'B) 42', 'C) Garbage', 'D) Compiler Error']);

  // --- Const ---
  add('mcq', 'What is the output?\n\nclass C {\n  int x;\npublic:\n  C(int v) : x(v) {}\n  int get() const { return x; }\n};\nint main() {\n  const C c(99);\n  cout << c.get();\n}', 'A) 99', ['A) 99', 'B) 0', 'C) Compiler Error', 'D) Garbage']);

  // --- Inheritance + constructors ---
  add('mcq', 'What is the output?\n\nclass A {\npublic:\n  A(int x) { cout << x; }\n};\nclass B : public A {\npublic:\n  B() : A(5) { cout << 6; }\n};\nint main() { B b; }', 'C) 56', ['A) 6', 'B) 5', 'C) 56', 'D) 65']);

  add('mcq', 'What is the output?\n\nclass Base {\npublic:\n  Base(char c) { cout << c; }\n};\nclass Mid : public Base {\npublic:\n  Mid() : Base(\'M\') { cout << \'m\'; }\n};\nclass Top : public Mid {\npublic:\n  Top() { cout << \'T\'; }\n};\nint main() { Top t; }', 'A) MmT', ['A) MmT', 'B) TMm', 'C) TmM', 'D) mMT']);

  // --- Array of objects ---
  add('mcq', 'What is the output?\n\nclass A {\npublic:\n  A() { cout << "A"; }\n};\nint main() { A arr[3]; }', 'B) AAA', ['A) A', 'B) AAA', 'C) A3', 'D) Compiler Error']);

  // --- Mixed ---
  add('mcq', 'What is the output?\n\nclass Animal {\npublic:\n  virtual void speak() { cout << "..."; }\n};\nclass Dog : public Animal {\npublic:\n  void speak() { cout << "Woof"; }\n};\nclass Cat : public Animal {\npublic:\n  void speak() { cout << "Meow"; }\n};\nint main() {\n  Animal* a[2];\n  a[0] = new Dog();\n  a[1] = new Cat();\n  a[0]->speak();\n  a[1]->speak();\n}', 'C) WoofMeow', ['A) ......', 'B) Woof...', 'C) WoofMeow', 'D) MeowWoof']);

  add('mcq', 'What is the output?\n\nclass A {\npublic:\n  int x;\n  A() : x(1) {}\n};\nclass B : public A {\npublic:\n  B() { x = 2; }\n};\nint main() {\n  B b;\n  cout << b.x;\n}', 'A) 2', ['A) 2', 'B) 1', 'C) 0', 'D) Compiler Error']);

  add('mcq', 'What is the output?\n\nclass A {\npublic:\n  virtual void f() { cout << "A"; }\n};\nclass B : public A {\npublic:\n  void f() { cout << "B"; }\n};\nint main() {\n  B b;\n  A& ref = b;\n  ref.f();\n  A a;\n  a.f();\n}', 'B) BA', ['A) AA', 'B) BA', 'C) AB', 'D) BB']);

  add('mcq', 'What is the output?\n\nclass Shape {\npublic:\n  virtual double area() { return 0; }\n};\nclass Rect : public Shape {\n  double w, h;\npublic:\n  Rect(double w, double h) : w(w), h(h) {}\n  double area() { return w * h; }\n};\nint main() {\n  Shape* s = new Rect(3, 4);\n  cout << s->area();\n}', 'A) 12', ['A) 12', 'B) 0', 'C) 34', 'D) 7']);

  add('mcq', 'What is the output?\n\nclass Foo {\n  int a, b;\npublic:\n  Foo() : b(1), a(b) {}\n  void print() { cout << a << b; }\n};\nint main() {\n  Foo f;\n  f.print();\n}', 'D) Undefined behavior — a is initialized before b (declaration order)', ['A) 11', 'B) 01', 'C) 10', 'D) Undefined behavior — a is initialized before b (declaration order)']);

  add('mcq', 'What is the output?\n\nclass A {\npublic:\n  A() { cout << "A"; }\n};\nclass B {\npublic:\n  B() { cout << "B"; }\n};\nclass C {\n  A a;\n  B b;\npublic:\n  C() { cout << "C"; }\n};\nint main() { C c; }', 'A) ABC', ['A) ABC', 'B) CBA', 'C) CAB', 'D) BAC']);

  add('mcq', 'What is the output?\n\nclass X {\npublic:\n  X(int n) { cout << n; }\n};\nint main() {\n  X a(1), b(2), c(3);\n}', 'B) 123', ['A) 321', 'B) 123', 'C) 111', 'D) Compiler Error']);

  add('mcq', 'What is the output?\n\nclass Base {\npublic:\n  virtual void show() = 0;\n};\nclass Child : public Base {\npublic:\n  void show() { cout << "C"; }\n};\nint main() {\n  Base* p = new Child();\n  p->show();\n}', 'A) C', ['A) C', 'B) Compiler Error', 'C) Runtime Error', 'D) Nothing']);

  add('mcq', 'What is the output?\n\nclass A {\nprotected:\n  int x;\npublic:\n  A() : x(10) {}\n};\nclass B : public A {\npublic:\n  void show() { cout << x; }\n};\nint main() {\n  B b;\n  b.show();\n}', 'A) 10', ['A) 10', 'B) 0', 'C) Compiler Error', 'D) Garbage']);

  add('mcq', 'What is the output?\n\nclass Point {\n  int x, y;\npublic:\n  Point(int a, int b) : x(a), y(b) {}\n  void show() { cout << x << y; }\n};\nint main() {\n  Point p(3, 7);\n  p.show();\n}', 'B) 37', ['A) 73', 'B) 37', 'C) 0', 'D) Compiler Error']);

  add('mcq', 'What is the output?\n\nclass Pair {\n  int a, b;\npublic:\n  Pair(int x, int y) : a(x), b(y) {}\n  int sum() { return a + b; }\n};\nint main() {\n  Pair p(8, 2);\n  cout << p.sum();\n}', 'A) 10', ['A) 10', 'B) 82', 'C) 8', 'D) 2']);

  add('mcq', 'What is the output?\n\nclass A {\npublic:\n  void show() { cout << "A"; }\n};\nclass B : public A {\npublic:\n  void show() { cout << "B"; }\n};\nint main() {\n  B b;\n  b.show();\n  b.A::show();\n}', 'C) BA', ['A) BB', 'B) AA', 'C) BA', 'D) AB']);

  add('mcq', 'What is the output?\n\nclass A {\npublic:\n  A() { cout << "A"; }\n  ~A() { cout << "a"; }\n};\nint main() {\n  A* p = new A();\n  delete p;\n  A q;\n}', 'B) AaAa', ['A) AAaa', 'B) AaAa', 'C) AAAA', 'D) Aa']);

  // --- Operator Overloading ---
  add('mcq', 'What is the output?\n\nclass Num {\n  int x;\npublic:\n  Num(int v) : x(v) {}\n  Num operator+(const Num& n) { return Num(x + n.x); }\n  void show() { cout << x; }\n};\nint main() {\n  Num a(3), b(4);\n  Num c = a + b;\n  c.show();\n}', 'A) 7', ['A) 7', 'B) 34', 'C) 0', 'D) Compiler Error']);

  add('mcq', 'What is the output?\n\nclass Counter {\n  int n;\npublic:\n  Counter(int v) : n(v) {}\n  Counter& operator++() { ++n; return *this; }\n  Counter operator++(int) { Counter t = *this; ++n; return t; }\n  void show() { cout << n; }\n};\nint main() {\n  Counter c(5);\n  (c++).show();\n  c.show();\n}', 'B) 56', ['A) 66', 'B) 56', 'C) 55', 'D) 65']);

  // --- Friend Functions ---
  add('mcq', 'What is the output?\n\nclass Box {\n  int w;\npublic:\n  Box(int v) : w(v) {}\n  friend void display(Box b);\n};\nvoid display(Box b) { cout << b.w; }\nint main() {\n  Box b(25);\n  display(b);\n}', 'C) 25', ['A) 0', 'B) Compiler Error', 'C) 25', 'D) Garbage']);

  // --- Static Local Variables ---
  add('mcq', 'What is the output?\n\nclass Gen {\npublic:\n  static int next() {\n    static int v = 0;\n    return ++v;\n  }\n};\nint main() {\n  cout << Gen::next();\n  cout << Gen::next();\n  cout << Gen::next();\n}', 'A) 123', ['A) 123', 'B) 111', 'C) 012', 'D) 000']);

  // --- Virtual Dispatch from Base Method ---
  add('mcq', 'What is the output?\n\nclass Base {\npublic:\n  virtual void name() { cout << "Base"; }\n  void call() { name(); }\n};\nclass Der : public Base {\npublic:\n  void name() { cout << "Der"; }\n};\nint main() {\n  Der d;\n  d.call();\n}', 'B) Der', ['A) Base', 'B) Der', 'C) BaseDer', 'D) Compiler Error']);

  // --- Method Chaining ---
  add('mcq', 'What is the output?\n\nclass Builder {\n  int val;\npublic:\n  Builder() : val(0) {}\n  Builder& add(int n) { val += n; return *this; }\n  Builder& mul(int n) { val *= n; return *this; }\n  void show() { cout << val; }\n};\nint main() {\n  Builder().add(3).mul(4).add(2).show();\n}', 'C) 14', ['A) 12', 'B) 32', 'C) 14', 'D) 20']);

  // --- Multiple Inheritance Construction/Destruction ---
  add('mcq', 'What is the output?\n\nclass A {\npublic:\n  A() { cout << "a"; }\n  ~A() { cout << "A"; }\n};\nclass B {\npublic:\n  B() { cout << "b"; }\n  ~B() { cout << "B"; }\n};\nclass C : public B, public A {\npublic:\n  C() { cout << "c"; }\n  ~C() { cout << "C"; }\n};\nint main() { C obj; }', 'A) bacCAB', ['A) bacCAB', 'B) abcCBA', 'C) bacCBA', 'D) abcCAB']);

  // --- Nested Member Construction/Destruction ---
  add('mcq', 'What is the output?\n\nclass A {\npublic:\n  A() { cout << "1"; }\n  ~A() { cout << "2"; }\n};\nclass B {\n  A a1;\n  A a2;\npublic:\n  B() { cout << "3"; }\n  ~B() { cout << "4"; }\n};\nint main() { B b; }', 'B) 113422', ['A) 311224', 'B) 113422', 'C) 113242', 'D) 311242']);

  // --- Stack Object Destruction Order ---
  add('mcq', 'What is the output?\n\nclass A {\n  int id;\npublic:\n  A(int i) : id(i) { cout << id; }\n  ~A() { cout << id; }\n};\nint main() {\n  A a(1);\n  A b(2);\n  A c(3);\n}', 'C) 123321', ['A) 123123', 'B) 321123', 'C) 123321', 'D) 321321']);

  // --- Overloaded Functions ---
  add('mcq', 'What is the output?\n\nclass Printer {\npublic:\n  void print(int x) { cout << "I"; }\n  void print(double x) { cout << "D"; }\n  void print(char x) { cout << "C"; }\n};\nint main() {\n  Printer p;\n  p.print(5);\n  p.print(3.14);\n  p.print(\'A\');\n}', 'A) IDC', ['A) IDC', 'B) III', 'C) IIC', 'D) DDD']);

  // --- Temporary Objects ---
  add('mcq', 'What is the output?\n\nclass Msg {\npublic:\n  Msg() { cout << "C"; }\n  ~Msg() { cout << "D"; }\n};\nint main() {\n  cout << "1";\n  Msg();\n  cout << "2";\n}', 'B) 1CD2', ['A) 1C2D', 'B) 1CD2', 'C) C1D2', 'D) 12CD']);

  // --- Nested Class ---
  add('mcq', 'What is the output?\n\nclass Outer {\npublic:\n  class Inner {\n  public:\n    void show() { cout << "I"; }\n  };\n  void show() { cout << "O"; }\n};\nint main() {\n  Outer o;\n  o.show();\n  Outer::Inner i;\n  i.show();\n}', 'A) OI', ['A) OI', 'B) IO', 'C) II', 'D) Compiler Error']);

  // --- Parameterized Inheritance Chain ---
  add('mcq', 'What is the output?\n\nclass A {\npublic:\n  A(int x) { cout << x; }\n};\nclass B : public A {\npublic:\n  B(int x) : A(x * 2) { cout << x; }\n};\nint main() { B b(3); }', 'C) 63', ['A) 33', 'B) 36', 'C) 63', 'D) 3']);

  // --- Default Arguments ---
  add('mcq', 'What is the output?\n\nclass Calc {\npublic:\n  int add(int a, int b = 5) { return a + b; }\n};\nint main() {\n  Calc c;\n  cout << c.add(3) << c.add(2, 3);\n}', 'A) 85', ['A) 85', 'B) 35', 'C) 58', 'D) 53']);

  // --- Virtual Destructor ---
  add('mcq', 'What is the output?\n\nclass A {\npublic:\n  virtual ~A() { cout << "A"; }\n};\nclass B : public A {\npublic:\n  ~B() { cout << "B"; }\n};\nint main() {\n  A* p = new B();\n  delete p;\n}', 'B) BA', ['A) A', 'B) BA', 'C) AB', 'D) B']);

  // --- Explicit Base Class Call ---
  add('mcq', 'What is the output?\n\nclass Base {\npublic:\n  virtual void f() { cout << "B"; }\n};\nclass Der : public Base {\npublic:\n  void f() { cout << "D"; Base::f(); }\n};\nint main() {\n  Der d;\n  d.f();\n}', 'A) DB', ['A) DB', 'B) BD', 'C) D', 'D) B']);

  // --- Pointer to Base ---
  add('mcq', 'What is the output?\n\nclass A {\npublic:\n  int x;\n  A() : x(5) {}\n};\nclass B : public A {\npublic:\n  int y;\n  B() : y(10) {}\n};\nint main() {\n  B b;\n  A* p = &b;\n  cout << p->x;\n}', 'A) 5', ['A) 5', 'B) 10', 'C) 0', 'D) Compiler Error']);

  // --- Conditional with Objects ---
  add('mcq', 'What is the output?\n\nclass Toggle {\n  bool on;\npublic:\n  Toggle(bool b) : on(b) {}\n  void show() { cout << (on ? "Y" : "N"); }\n};\nint main() {\n  Toggle a(true), b(false);\n  a.show();\n  b.show();\n}', 'C) YN', ['A) YY', 'B) NN', 'C) YN', 'D) NY']);

  // --- Default Copy vs Explicit Constructor ---
  add('mcq', 'What is the output?\n\nclass A {\npublic:\n  int x;\n  A() : x(0) { cout << "D"; }\n  A(int v) : x(v) { cout << "P"; }\n};\nint main() {\n  A a;\n  A b(7);\n  A c = b;\n  cout << c.x;\n}', 'B) DP7', ['A) DPP7', 'B) DP7', 'C) DPD7', 'D) DDP7']);

  // --- Polymorphic Array ---
  add('mcq', 'What is the output?\n\nclass Shape {\npublic:\n  virtual void draw() { cout << "S"; }\n};\nclass Circle : public Shape {\npublic:\n  void draw() { cout << "C"; }\n};\nclass Square : public Shape {\npublic:\n  void draw() { cout << "Q"; }\n};\nint main() {\n  Shape* arr[3];\n  arr[0] = new Shape();\n  arr[1] = new Circle();\n  arr[2] = new Square();\n  for(int i = 0; i < 3; i++) arr[i]->draw();\n}', 'A) SCQ', ['A) SCQ', 'B) SSS', 'C) CQS', 'D) SCS']);

  await adminService.seedQuestionsForLevel(4, questions);
  console.log('Level 4 seeded with 60 questions!');
  await app.close();
}

bootstrap().catch(console.error);
