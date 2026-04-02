import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { AdminService } from '../admin/admin.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const adminService = app.get(AdminService);

  const questions: any[] = [];
  const level = 7;
  let questionId = 701;

  const add = (type: string, text: string, answer: string, opts?: string[]) => {
    questions.push({ id: questionId++, level, roundKey: 'round1', type, text, correct: answer, options: opts || null, isActive: true });
  };

  // LEVEL 7 — Harder Output Prediction + Error Finding
  // Multi-class chains, vtable quirks, copy semantics bugs, diamond, template basics

  add('mcq', 'What is the output?\n\nclass A {\npublic:\n  A() { cout << "A"; }\n  virtual ~A() { cout << "~A"; }\n};\nclass B : public A {\npublic:\n  B() { cout << "B"; }\n  ~B() { cout << "~B"; }\n};\nclass C : public B {\npublic:\n  C() { cout << "C"; }\n  ~C() { cout << "~C"; }\n};\nint main() {\n  A* p = new C();\n  delete p;\n}', 'B) ABC~C~B~A', ['A) ABC~A', 'B) ABC~C~B~A', 'C) CBA~C~B~A', 'D) ABC~A~B~C']);
  add('mcq', 'What is the output?\n\nclass B {\npublic:\n  virtual void f() { cout << "B"; }\n};\nclass D : public B {\npublic:\n  void f() override { cout << "D"; }\n};\nvoid call(B& b) { b.f(); }\nint main() {\n  D d;\n  call(d);\n}', 'B) D', ['A) B', 'B) D', 'C) BD', 'D) Compiler error']);
  add('mcq', 'What is the output?\n\nclass A {\npublic:\n  int x;\n  A(int v = 0) : x(v) {}\n};\nclass B : virtual public A {\npublic:\n  B(int v) : A(v) {}\n};\nclass C : virtual public A {\npublic:\n  C(int v) : A(v) {}\n};\nclass D : public B, public C {\npublic:\n  D() : A(99), B(1), C(2) {}\n};\nint main() {\n  D d;\n  cout << d.x;\n}', 'A) 99', ['A) 99', 'B) 1', 'C) 2', 'D) Ambiguous — compile error']);
  add('mcq', 'What is the output?\n\nclass A {\npublic:\n  int x;\n  A(int v) : x(v) { cout << "A" << x; }\n  virtual ~A() { cout << "~A"; }\n};\nclass B : public A {\npublic:\n  B(int v) : A(v + 1) { cout << "B"; }\n  ~B() { cout << "~B"; }\n};\nint main() {\n  A* p = new B(3);\n  delete p;\n}', 'B) A4B~B~A', ['A) A3B~B~A', 'B) A4B~B~A', 'C) A4B~A', 'D) BA4~B~A']);
  add('mcq', 'What is the output?\n\nclass A {\npublic:\n  virtual void print() { cout << "A"; }\n};\nclass B : public A {\npublic:\n  void print() { cout << "B"; }\n};\nclass C : public A {\npublic:\n  void print() { cout << "C"; }\n};\nint main() {\n  A* arr[] = { new A(), new B(), new C() };\n  for (auto p : arr) p->print();\n}', 'A) ABC', ['A) ABC', 'B) AAA', 'C) CBА', 'D) Compiler error']);
  add('mcq', 'What is the output?\n\nclass Node {\npublic:\n  int v;\n  Node(int x) : v(x) {}\n};\nclass List {\n  Node* head;\npublic:\n  List(int x) { head = new Node(x); }\n  List(const List& o) { head = new Node(o.head->v + 10); }\n  void show() { cout << head->v; }\n  ~List() { delete head; }\n};\nint main() {\n  List a(5);\n  List b = a;\n  b.show();\n}', 'B) 15', ['A) 5', 'B) 15', 'C) 0', 'D) Crash']);
  add('mcq', 'What is the output?\n\nclass A {\npublic:\n  void f() { cout << "A::" << id(); }\n  virtual string id() { return "A"; }\n};\nclass B : public A {\npublic:\n  string id() { return "B"; }\n};\nint main() {\n  B b;\n  b.f();\n}', 'B) A::B', ['A) A::A', 'B) A::B', 'C) B::B', 'D) Compiler error']);
  add('mcq', 'What is the output?\n\nstruct Point {\n  int x, y;\n  Point(int a, int b) : x(a), y(b) {}\n  Point operator-(Point p) { return Point(x - p.x, y - p.y); }\n};\nint main() {\n  Point a(7,3), b(2,1);\n  Point c = a - b;\n  cout << c.x << c.y;\n}', 'A) 52', ['A) 52', 'B) 94', 'C) 55', 'D) Compiler error']);
  add('mcq', 'What is the output?\n\nclass A {\npublic:\n  int v = 1;\n  virtual int get() { return v; }\n};\nclass B : public A {\npublic:\n  int v = 2;\n  int get() { return v; }\n};\nint main() {\n  A* p = new B();\n  cout << p->get() << p->v;\n}', 'B) 21', ['A) 11', 'B) 21', 'C) 22', 'D) 12']);
  add('mcq', 'What is the output?\n\nclass Counter {\n  int c;\npublic:\n  Counter(int v = 0) : c(v) {}\n  Counter operator++(int) {  // postfix\n    Counter tmp = *this;\n    c++;\n    return tmp;\n  }\n  void show() { cout << c; }\n};\nint main() {\n  Counter x(5);\n  Counter y = x++;\n  x.show();\n  y.show();\n}', 'A) 65', ['A) 65', 'B) 55', 'C) 66', 'D) 56']);

  add('mcq', 'What is the output?\n\nclass A {\npublic:\n  virtual void go() { cout << "A"; }\n};\nclass B : public A {\npublic:\n  void go() { cout << "B"; }\n};\nclass C : public A {\npublic:\n  void go() { cout << "C"; }\n};\nvoid run(A* p) { p->go(); }\nint main() {\n  run(new B());\n  run(new A());\n  run(new C());\n}', 'B) BAC', ['A) ABC', 'B) BAC', 'C) AAA', 'D) Compiler error']);
  add('mcq', 'What is the output?\n\nclass X {\npublic:\n  X() { cout << "X"; }\n  X(int) { cout << "Xi"; }\n  X(const X&) { cout << "Xc"; }\n};\nX f() { return X(1); }\nint main() {\n  X a = f();\n}', 'B) Xi', ['A) XXi', 'B) Xi', 'C) XiXc', 'D) Xc']);
  add('mcq', 'What is the output?\n\nclass Base {\n  static int count;\npublic:\n  Base() { count++; }\n  static int getCount() { return count; }\n};\nint Base::count = 0;\nclass D1 : public Base {};\nclass D2 : public Base {};\nint main() {\n  D1 a;\n  D2 b;\n  D1 c;\n  cout << Base::getCount();\n}', 'C) 3', ['A) 0', 'B) 2', 'C) 3', 'D) Compiler error']);
  add('mcq', 'What is the output?\n\nclass Shape {\npublic:\n  virtual double area() = 0;\n  void describe() { cout << "Area=" << area(); }\n};\nclass Rect : public Shape {\n  int w, h;\npublic:\n  Rect(int a, int b) : w(a), h(b) {}\n  double area() { return w * h; }\n};\nint main() {\n  Rect r(4, 5);\n  r.describe();\n}', 'A) Area=20', ['A) Area=20', 'B) Area=0', 'C) Compiler error', 'D) Area=9']);
  add('mcq', 'What is the output?\n\nclass A {\npublic:\n  A() { cout << "a"; }\n  A(const A&) { cout << "ac"; }\n};\nclass B {\n  A x;\npublic:\n  B() {}\n  B(const B& b) : x(b.x) {}\n};\nint main() {\n  B b1;\n  B b2 = b1;\n}', 'B) aac', ['A) aa', 'B) aac', 'C) ac', 'D) Compiler error']);
  add('mcq', 'What is the output?\n\nstruct S {\n  int x;\n  S(int v) : x(v) {}\n  S& operator=(const S& o) {\n    x = o.x * 2;\n    return *this;\n  }\n};\nint main() {\n  S a(5), b(3);\n  a = b;\n  cout << a.x;\n}', 'B) 6', ['A) 3', 'B) 6', 'C) 5', 'D) 10']);

  add('mcq', 'What is the output?\n\nclass A {\npublic:\n  virtual void f() { cout << "A"; }\n  void g() { f(); }\n};\nclass B : public A {\npublic:\n  void f() { cout << "B"; }\n};\nint main() {\n  B b;\n  b.g();\n}', 'B) B', ['A) A', 'B) B', 'C) AB', 'D) Compiler error']);
  add('mcq', 'What is the output?\n\nclass Matrix {\n  int data[2][2];\npublic:\n  Matrix(int a,int b,int c,int d) { data[0][0]=a;data[0][1]=b;data[1][0]=c;data[1][1]=d; }\n  int trace() { return data[0][0]+data[1][1]; }\n};\nint main() {\n  Matrix m(1,2,3,4);\n  cout << m.trace();\n}', 'A) 5', ['A) 5', 'B) 10', 'C) 6', 'D) Compiler error']);
  add('mcq', 'What is the output?\n\nclass A {\npublic:\n  int x = 5;\n  virtual int val() { return x; }\n};\nclass B : public A {\npublic:\n  int x = 10;\n  int val() { return x; }\n};\nint main() {\n  A a;\n  B b;\n  A& r = b;\n  cout << r.val() << r.x;\n}', 'A) 105', ['A) 105', 'B) 55', 'C) 1010', 'D) 510']);
  add('mcq', 'What is the output?\n\nclass Wallet {\n  double money;\npublic:\n  Wallet(double v) : money(v) {}\n  Wallet operator+(double n) { return Wallet(money + n); }\n  void show() { cout << money; }\n};\nint main() {\n  Wallet w(100);\n  Wallet w2 = w + 50;\n  w2.show();\n}', 'C) 150', ['A) 100', 'B) 50', 'C) 150', 'D) Compiler error']);
  add('mcq', 'What is the output?\n\nvoid inc(int& x) { x++; }\nvoid inc(int* p) { (*p)++; }\nint main() {\n  int a = 5;\n  inc(a);\n  inc(&a);\n  cout << a;\n}', 'B) 7', ['A) 5', 'B) 7', 'C) 6', 'D) Compiler error']);

  add('mcq', 'What is the output?\n\nclass Timer {\n  int s;\npublic:\n  Timer(int v) : s(v) {}\n  Timer& operator--() { --s; return *this; }\n  bool done() { return s <= 0; }\n  void show() { cout << s; }\n};\nint main() {\n  Timer t(3);\n  while(!t.done()) { --t; }\n  t.show();\n}', 'A) 0', ['A) 0', 'B) 1', 'C) -1', 'D) Compiler error']);
  add('mcq', 'What is the output?\n\nclass A {\npublic:\n  A() { cout << "A"; }\n  A(const A&) { cout << "cA"; }\n};\nA make() { return A(); }\nint main() {\n  A x = make();\n}', 'B) A', ['A) AcA', 'B) A', 'C) cA', 'D) Compiler error']);
  add('mcq', 'What is the output?\n\nclass Cat {\n  string name;\npublic:\n  Cat(string n) : name(n) {}\n  bool operator==(const Cat& c) { return name == c.name; }\n};\nint main() {\n  Cat a("Luna"), b("Luna"), c("Max");\n  cout << (a==b) << (b==c);\n}', 'A) 10', ['A) 10', 'B) 01', 'C) 11', 'D) 00']);
  add('mcq', 'What is the output?\n\nclass P {\npublic:\n  virtual void greet() = 0;\n  void hello() { cout << "Hello,"; greet(); }\n};\nclass Q : public P {\npublic:\n  void greet() { cout << "Q!"; }\n};\nint main() {\n  Q q;\n  q.hello();\n}', 'B) Hello,Q!', ['A) Hello,', 'B) Hello,Q!', 'C) Compiler error', 'D) Nothing']);
  add('mcq', 'What is the output?\n\nclass Secret {\n  int code;\npublic:\n  Secret(int c) : code(c) {}\n  friend void reveal(Secret& s1, Secret& s2);\n};\nvoid reveal(Secret& s1, Secret& s2) {\n  int temp = s1.code;\n  s1.code = s2.code;\n  s2.code = temp;\n  cout << s1.code << s2.code;\n}\nint main() {\n  Secret a(3), b(7);\n  reveal(a, b);\n}', 'B) 73', ['A) 37', 'B) 73', 'C) 33', 'D) Compiler error — code is private']);

  add('mcq', 'What is the output?\n\nclass Base {\npublic:\n  Base() { init(); }\n  virtual void init() { cout << "Base"; }\n};\nclass Der : public Base {\npublic:\n  Der() { init(); }\n  void init() { cout << "Der"; }\n};\nint main() {\n  Der d;\n}', 'B) BaseDer', ['A) DerDer', 'B) BaseDer', 'C) Compiler error', 'D) BaseDerDer']);
  add('mcq', 'What is the output?\n\nstruct A {\n  int x;\n  A(int v) : x(v) {}\n};\nstruct B : A {\n  int y;\n  B(int a, int b) : A(a), y(b) {}\n  void show() { cout << x << y; }\n};\nint main() {\n  B b(3, 4);\n  b.show();\n}', 'A) 34', ['A) 34', 'B) 43', 'C) 7', 'D) Compiler error']);
  add('mcq', 'What is the output?\n\nclass Obj {\n  static int total;\npublic:\n  Obj() { total++; }\n  Obj(const Obj&) { total++; }\n  ~Obj() { total--; }\n  static int count() { return total; }\n};\nint Obj::total = 0;\nint main() {\n  Obj a;\n  {\n    Obj b;\n    Obj c = b;\n  }\n  cout << Obj::count();\n}', 'A) 1', ['A) 1', 'B) 2', 'C) 3', 'D) 0']);
  add('mcq', 'What is the output?\n\nclass A {\npublic:\n  virtual void print() { cout << "A"; }\n};\nclass B : public A {};\nclass C : public B {\npublic:\n  void print() { cout << "C"; }\n};\nint main() {\n  A* p = new C();\n  p->print();\n}', 'B) C', ['A) A', 'B) C', 'C) B', 'D) Compiler error']);
  add('mcq', 'What is the output?\n\nclass V {\n  int* p;\npublic:\n  V(int v) { p = new int(v); cout << "V"; }\n  V(const V& o) { p = new int(*o.p + 1); cout << "Vc"; }\n  ~V() { delete p; cout << "~V"; }\n  void show() { cout << *p; }\n};\nint main() {\n  V a(10);\n  V b = a;\n  b.show();\n}', 'D) VVc11~V~V', ['A) VVc10~V~V', 'B) V10', 'C) VVc10', 'D) VVc11~V~V']);

  add('mcq', 'What is the output?\n\nclass A {\npublic:\n  virtual int num() { return 1; }\n};\nclass B : public A {\npublic:\n  int num() { return 2; }\n};\nclass C : public B {\npublic:\n  int num() { return 3; }\n};\nint main() {\n  A* p = new C();\n  cout << p->num();\n  B* q = new C();\n  cout << q->num();\n}', 'A) 33', ['A) 33', 'B) 13', 'C) 31', 'D) 12']);
  add('mcq', 'What is the output?\n\nclass Lock {\n  bool locked;\npublic:\n  Lock() : locked(true) { cout << "L"; }\n  ~Lock() { cout << "~L"; }\n  bool isLocked() { return locked; }\n  void unlock() { locked = false; cout << "U"; }\n};\nint main() {\n  Lock l;\n  if(l.isLocked()) l.unlock();\n}', 'B) LU~L', ['A) LU', 'B) LU~L', 'C) L~L', 'D) UL~L']);
  add('mcq', 'What is the output?\n\nclass A {\npublic:\n  A(int) { cout << "A"; }\n  A(double) { cout << "Ad"; }\n};\nint main() {\n  A a(1);\n  A b(1.0);\n}', 'A) AAd', ['A) AAd', 'B) AdA', 'C) AA', 'D) AdAd']);
  add('mcq', 'What is the output?\n\nclass Pair {\n  int a, b;\npublic:\n  Pair(int x, int y) : a(x), b(y) {}\n  Pair& operator+=(int n) { a+=n; b+=n; return *this; }\n  void show() { cout << a << "," << b; }\n};\nint main() {\n  Pair p(2,3);\n  (p += 1) += 2;\n  p.show();\n}', 'B) 5,6', ['A) 3,4', 'B) 5,6', 'C) 2,3', 'D) 4,5']);
  add('mcq', 'What is the output?\n\nclass A {\npublic:\n  virtual ~A() { cout << "~A"; }\n  void f() { cout << "f"; }\n};\nint main() {\n  A* p = new A();\n  p->f();\n  delete p;\n}', 'B) f~A', ['A) f', 'B) f~A', 'C) ~A', 'D) ~Af']);

  add('mcq', 'What is the output?\n\nclass Sensor {\n  int v;\npublic:\n  Sensor(int x) : v(x) {}\n  operator int() { return v; }\n};\nint main() {\n  Sensor s(42);\n  int n = s;\n  cout << n + 8;\n}', 'A) 50', ['A) 50', 'B) 42', 'C) 8', 'D) Compiler error']);
  add('mcq', 'What is the output?\n\nclass Tree {\n  int depth;\npublic:\n  Tree(int d = 0) : depth(d) {}\n  Tree grow() { return Tree(depth + 1); }\n  void show() { cout << depth; }\n};\nint main() {\n  Tree t;\n  t.grow().grow().show();\n}', 'B) 2', ['A) 0', 'B) 2', 'C) 1', 'D) 3']);
  add('mcq', 'What is the output?\n\nclass A {\npublic:\n  int* p;\n  A(int v) { p = new int(v); }\n  A(const A& o) = delete;\n  ~A() { delete p; }\n};\nint main() {\n  A a(5);\n  cout << *a.p;\n}', 'A) 5', ['A) 5', 'B) Crash', 'C) Compiler error — copy called', 'D) 0']);
  add('mcq', 'What is the output?\n\nclass A {\npublic:\n  virtual string tag() { return "A"; }\n};\nclass B : public A {\npublic:\n  string tag() { return "B"; }\n};\nstring chain(A* p) {\n  return p->tag() + "[chain]";\n}\nint main() {\n  cout << chain(new B());\n}', 'B) B[chain]', ['A) A[chain]', 'B) B[chain]', 'C) Compiler error', 'D) [chain]']);
  add('mcq', 'What is the output?\n\nclass A {\npublic:\n  A() { cout << "A"; }\n  ~A() { cout << "~A"; }\n};\nclass B : public A {\n  A extra;\npublic:\n  B() { cout << "B"; }\n  ~B() { cout << "~B"; }\n};\nint main() {\n  B b;\n}', 'B) AAB~B~A~A', ['A) AB~B~A', 'B) AAB~B~A~A', 'C) AB~A~B', 'D) AAB~A~A~B']);

  add('mcq', 'What is the output?\n\nclass Shape {\npublic:\n  virtual double area() = 0;\n  virtual ~Shape() {}\n};\nclass Circle : public Shape {\n  int r;\npublic:\n  Circle(int v) : r(v) {}\n  double area() { return r * r; }\n};\nclass Square : public Shape {\n  int s;\npublic:\n  Square(int v) : s(v) {}\n  double area() { return s * s; }\n};\nint main() {\n  Shape* arr[] = { new Circle(3), new Square(4) };\n  cout << arr[0]->area() << " " << arr[1]->area();\n}', 'A) 9 16', ['A) 9 16', 'B) 16 9', 'C) Compiler error', 'D) 0 0']);
  add('mcq', 'What is the output?\n\nclass A {\npublic:\n  void show() { cout << "A"; }\n};\nclass B : private A {\npublic:\n  void run() { show(); }\n};\nint main() {\n  B b;\n  b.run();\n}', 'A) A', ['A) A', 'B) Compiler error', 'C) B', 'D) Nothing']);
  add('mcq', 'What is the output?\n\nclass State {\n  int v;\npublic:\n  State(int x) : v(x) {}\n  State next() const { return State(v + 1); }\n  void print() const { cout << v; }\n};\nint main() {\n  State s(0);\n  s.next().next().next().print();\n}', 'C) 3', ['A) 0', 'B) 1', 'C) 3', 'D) Compiler error']);
  add('mcq', 'What is the output?\n\nclass A {\npublic:\n  virtual void f() { cout << "A"; }\n  void h() { cout << "h"; f(); }\n};\nclass B : public A {\npublic:\n  void f() { cout << "B"; }\n};\nclass C : public B {\npublic:\n  void f() { cout << "C"; }\n};\nint main() {\n  A* p = new C();\n  p->h();\n}', 'B) hC', ['A) hA', 'B) hC', 'C) hBC', 'D) hABC']);

  add('mcq', 'What is the output?\n\nstruct Vec {\n  int x, y;\n  Vec(int a, int b) : x(a), y(b) {}\n  Vec operator*(int n) { return Vec(x*n, y*n); }\n  void show() { cout << x << "," << y; }\n};\nint main() {\n  Vec v(2, 3);\n  (v * 3).show();\n}', 'A) 6,9', ['A) 6,9', 'B) 2,3', 'C) 5,6', 'D) Compiler error']);
  add('mcq', 'What is the output?\n\nclass A {\npublic:\n  int n;\n  A(int v) : n(v) {}\n  virtual A doubled() { return A(n*2); }\n  void show() { cout << n; }\n};\nclass B : public A {\npublic:\n  B(int v) : A(v) {}\n  A doubled() { return B(n*3); }\n};\nint main() {\n  B b(5);\n  b.doubled().show();\n}', 'C) 15', ['A) 10', 'B) 5', 'C) 15', 'D) Compiler error']);
  add('mcq', 'What is the output?\n\nclass Log {\npublic:\n  Log() { cout << "["; }\n  ~Log() { cout << "]"; }\n};\nvoid process() {\n  Log l;\n  cout << "work";\n}\nint main() {\n  cout << "start ";\n  process();\n  cout << " end";\n}', 'B) start [work] end', ['A) start work end', 'B) start [work] end', 'C) [start work end]', 'D) [work]start end']);
  add('mcq', 'What is the output?\n\nclass Iter {\n  int cur, end;\npublic:\n  Iter(int e) : cur(0), end(e) {}\n  bool hasNext() { return cur < end; }\n  int next() { return cur++; }\n};\nint main() {\n  Iter it(4);\n  while(it.hasNext()) cout << it.next();\n}', 'A) 0123', ['A) 0123', 'B) 1234', 'C) 0124', 'D) Compiler error']);

  add('mcq', 'What is the output?\n\nclass A {\n  int x;\npublic:\n  A(int v) : x(v) {}\n  A operator!() { return A(-x); }\n  void show() { cout << x; }\n};\nint main() {\n  A a(5);\n  (!a).show();\n}', 'B) -5', ['A) 5', 'B) -5', 'C) 0', 'D) Compiler error']);
  add('mcq', 'What is the output?\n\nclass Proxy {\n  int& ref;\npublic:\n  Proxy(int& r) : ref(r) {}\n  operator int() { return ref; }\n  Proxy& operator=(int v) { ref = v; return *this; }\n};\nint main() {\n  int x = 10;\n  Proxy p(x);\n  p = 42;\n  cout << x;\n}', 'A) 42', ['A) 42', 'B) 10', 'C) 0', 'D) Compiler error']);
  add('mcq', 'What is the output?\n\nclass A {\npublic:\n  virtual void say() { cout << "A"; }\n};\nclass B : public A {\npublic:\n  virtual void say() { cout << "B"; }\n};\nclass C : public B {\npublic:\n  void say() { B::say(); cout << "C"; }\n};\nint main() {\n  C c;\n  A* p = &c;\n  p->say();\n}', 'B) BC', ['A) ABC', 'B) BC', 'C) C', 'D) AC']);

  // ── 20 ADDITIONAL LEVEL 7 QUESTIONS (IDs 751–770) ──

  add('mcq', 'What is the output?\n\nclass Shape {\npublic:\n  virtual void draw() { cout << "S"; }\n};\nclass Circle : public Shape {\npublic:\n  void draw() { cout << "C"; }\n};\nclass FilledCircle : public Circle {\npublic:\n  void draw() { Circle::draw(); cout << "F"; }\n};\nint main() {\n  Shape* s = new FilledCircle();\n  s->draw();\n}', 'C) CF', ['A) S', 'B) C', 'C) CF', 'D) SCF']);

  add('mcq', 'What is the output?\n\nclass A {\n  int x;\npublic:\n  A(int v = 0) : x(v) { cout << x; }\n  A(const A& o) : x(o.x + 1) { cout << x; }\n};\nint main() {\n  A a(5);\n  A b = a;\n  A c = b;\n}', 'A) 567', ['A) 567', 'B) 555', 'C) 556', 'D) 578']);

  add('mcq', 'What is the output?\n\nclass Counter {\n  static int n;\npublic:\n  Counter() { ++n; }\n  Counter(const Counter&) { ++n; }\n  ~Counter() { --n; }\n  static int count() { return n; }\n};\nint Counter::n = 0;\nvoid f(Counter c) {}\nint main() {\n  Counter a;\n  f(a);\n  cout << Counter::count();\n}', 'A) 1', ['A) 1', 'B) 2', 'C) 0', 'D) 3']);

  add('mcq', 'What is the output?\n\nclass A {\npublic:\n  A() { cout << "A"; }\n  virtual ~A() { cout << "a"; }\n};\nclass B : public A {\n  A member;\npublic:\n  B() { cout << "B"; }\n  ~B() { cout << "b"; }\n};\nint main() {\n  A* p = new B();\n  delete p;\n}', 'C) AABbaa', ['A) ABba', 'B) AABba', 'C) AABbaa', 'D) ABBbaa']);

  add('mcq', 'What is the output?\n\nclass Stack {\n  int arr[5];\n  int top;\npublic:\n  Stack() : top(-1) {}\n  void push(int v) { arr[++top] = v; }\n  int pop() { return arr[top--]; }\n  bool empty() { return top == -1; }\n};\nint main() {\n  Stack s;\n  s.push(10);\n  s.push(20);\n  s.push(30);\n  cout << s.pop() << s.pop();\n}', 'A) 3020', ['A) 3020', 'B) 2030', 'C) 1020', 'D) 3010']);

  add('mcq', 'What is the output?\n\nclass Animal {\npublic:\n  virtual void speak() { cout << "..."; }\n  void call() { speak(); }\n};\nclass Dog : public Animal {\npublic:\n  void speak() { cout << "Woof"; }\n};\nclass Puppy : public Dog {\npublic:\n  void speak() { Dog::speak(); cout << "!"; }\n};\nint main() {\n  Animal* a = new Puppy();\n  a->call();\n}', 'C) Woof!', ['A) ...', 'B) Woof', 'C) Woof!', 'D) ...Woof!']);

  add('mcq', 'What is the output?\n\nclass Num {\n  int v;\npublic:\n  Num(int x) : v(x) {}\n  Num operator+(const Num& o) { return Num(v + o.v); }\n  Num operator*(const Num& o) { return Num(v * o.v); }\n  void show() { cout << v; }\n};\nint main() {\n  Num a(2), b(3), c(4);\n  (a + b * c).show();\n}', 'A) 14', ['A) 14', 'B) 20', 'C) 24', 'D) 10']);

  add('mcq', 'What is the output?\n\nclass A {\npublic:\n  int x;\n  A(int v) : x(v) {}\n  virtual int val() { return x; }\n};\nclass B : public A {\npublic:\n  B(int v) : A(v * 2) {}\n  int val() { return x + 1; }\n};\nint main() {\n  A* p = new B(5);\n  cout << p->val() << p->x;\n}', 'B) 1110', ['A) 510', 'B) 1110', 'C) 65', 'D) 105']);

  add('mcq', 'What is the output?\n\nclass Msg {\n  string s;\npublic:\n  Msg(string x) : s(x) { cout << "+"; }\n  Msg(const Msg& o) : s(o.s) { cout << "c"; }\n  ~Msg() { cout << "-"; }\n  void print() { cout << s; }\n};\nMsg relay(Msg m) { return m; }\nint main() {\n  Msg a("hi");\n  relay(a).print();\n}', 'B) +cchi--', ['A) +chi-', 'B) +cchi--', 'C) +chi--', 'D) +ccchi---']);

  add('mcq', 'What is the output?\n\nclass Base {\npublic:\n  virtual void f(int x = 10) { cout << "B" << x; }\n};\nclass Der : public Base {\npublic:\n  void f(int x = 20) { cout << "D" << x; }\n};\nint main() {\n  Base* p = new Der();\n  p->f();\n}', 'A) D10', ['A) D10', 'B) D20', 'C) B10', 'D) B20']);

  add('mcq', 'What is the output?\n\nclass A {\npublic:\n  virtual void act() { cout << "A"; }\n};\nclass B : virtual public A {\npublic:\n  void act() { cout << "B"; }\n};\nclass C : virtual public A {\npublic:\n  void act() { cout << "C"; }\n};\nclass D : public B, public C {\npublic:\n  void act() { B::act(); C::act(); }\n};\nint main() {\n  A* p = new D();\n  p->act();\n}', 'B) BC', ['A) A', 'B) BC', 'C) Compiler error', 'D) ABC']);

  add('mcq', 'What is the output?\n\nclass Safe {\n  int* p;\npublic:\n  Safe(int v) { p = new int(v); }\n  Safe(const Safe& o) { p = new int(*o.p); }\n  ~Safe() { delete p; }\n  int get() { return *p; }\n};\nint main() {\n  Safe a(42);\n  Safe b = a;\n  cout << a.get() << b.get();\n}', 'A) 4242', ['A) 4242', 'B) 42 then crash', 'C) Undefined', 'D) Compiler error']);

  add('mcq', 'What is the output?\n\nclass X {\n  int a, b;\npublic:\n  X(int v) : a(v), b(a * 2) {}\n  void show() { cout << a << b; }\n};\nint main() {\n  X x(3);\n  x.show();\n}', 'A) 36', ['A) 36', 'B) 33', 'C) 30', 'D) Undefined']);

  add('mcq', 'What is the output?\n\nclass A {\npublic:\n  void f() { cout << "A::f "; }\n  virtual void g() { cout << "A::g "; }\n};\nclass B : public A {\npublic:\n  void f() { cout << "B::f "; }\n  void g() { cout << "B::g "; }\n};\nint main() {\n  B b;\n  A* p = &b;\n  p->f();\n  p->g();\n}', 'B) A::f B::g', ['A) B::f B::g', 'B) A::f B::g', 'C) A::f A::g', 'D) B::f A::g']);

  add('mcq', 'What is the output?\n\nclass Wrap {\n  int v;\npublic:\n  Wrap(int x) : v(x) {}\n  operator int() const { return v; }\n  Wrap operator-() const { return Wrap(-v); }\n};\nint main() {\n  Wrap w(7);\n  int r = -w + 3;\n  cout << r;\n}', 'A) -4', ['A) -4', 'B) 4', 'C) 10', 'D) Compiler error']);

  add('mcq', 'What is the output?\n\nclass Logger {\npublic:\n  Logger(const char* s) { cout << s << "+"; }\n  ~Logger() { cout << "-"; }\n};\nint main() {\n  Logger a("x");\n  {\n    Logger b("y");\n    Logger c("z");\n  }\n  cout << "end";\n}', 'B) x+y+z+--end-', ['A) x+y+z+end---', 'B) x+y+z+--end-', 'C) x+y+z+---end', 'D) y+z+--x+end-']);

  add('mcq', 'What is the output?\n\nclass Arr {\n  int data[3];\npublic:\n  Arr() { data[0]=1; data[1]=2; data[2]=3; }\n  int& operator[](int i) { return data[i]; }\n};\nint main() {\n  Arr a;\n  a[1] = 10;\n  cout << a[0] << a[1] << a[2];\n}', 'A) 1103', ['A) 1103', 'B) 123', 'C) 10103', 'D) Compiler error']);

  add('mcq', 'What is the output?\n\nclass A {\nprotected:\n  int x;\npublic:\n  A(int v) : x(v) {}\n  virtual int get() { return x; }\n};\nclass B : public A {\npublic:\n  B(int v) : A(v + 5) {}\n  int get() { return x * 2; }\n};\nclass C : public B {\npublic:\n  C(int v) : B(v) {}\n};\nint main() {\n  A* p = new C(3);\n  cout << p->get();\n}', 'A) 16', ['A) 16', 'B) 6', 'C) 8', 'D) 3']);

  add('mcq', 'What is the output?\n\nclass Pair {\npublic:\n  int a, b;\n  Pair(int x, int y) : a(x), b(y) {}\n  bool operator==(const Pair& o) { return a == o.a && b == o.b; }\n  bool operator!=(const Pair& o) { return !(*this == o); }\n};\nint main() {\n  Pair p(1, 2), q(2, 1);\n  cout << (p == q) << (p != q);\n}', 'B) 01', ['A) 10', 'B) 01', 'C) 00', 'D) 11']);

  add('mcq', 'What is the output?\n\nclass Base {\npublic:\n  virtual void show() { cout << "Base"; }\n};\nclass Mid : public Base {\npublic:\n  void show() { cout << "Mid"; }\n};\nclass Top : public Mid {\npublic:\n  void show() { Base::show(); Mid::show(); }\n};\nint main() {\n  Base* p = new Top();\n  p->show();\n}', 'A) BaseMid', ['A) BaseMid', 'B) Top', 'C) MidBase', 'D) BaseBaseMid']);

  await adminService.seedQuestionsForLevel(level, questions);
  console.log('Level 7 seeded with 70 hard output prediction questions!');
  await app.close();
}

bootstrap().catch(console.error);
