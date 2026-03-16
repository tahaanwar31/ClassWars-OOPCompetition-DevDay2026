import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { AdminService } from '../admin/admin.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const adminService = app.get(AdminService);

  console.log('🚀 Seeding Level 6 (50 questions)...\n');

  const questions = [];
  const level = 6;
  let questionId = 601; // Starting from 601 for Level 6

  // Helper
  const add = (type: string, text: string, answer: string, opts?: string[]) => {
    questions.push({ 
      id: questionId++,
      level, 
      roundKey: 'round1', 
      type, 
      text, 
      correct: answer, 
      options: opts || null, 
      isActive: true 
    });
  };

  // Level 6 Questions from document
  add('output', `class A {
    int x;
    public:
        A(int a = 0) : x(a) { cout << x; }
        virtual ~A() { cout << x; }
};
class B : public A {
    int y;
    public:
        B(int a, int b) : A(a), y(b) { cout << y; }
        ~B() { cout << y; }
};
class C : public B {
    int z;
    public:
        C(int a, int b, int c) : B(a, b), z(c) { cout << z; }
        ~C() { cout << z; }
};
int main() {
    A *p = new C(1, 2, 3);
    delete p;
    return 0;
}
What is the output?`, '12332211');

  add('output', `class Test {
    static int count;
    int id;
    public:
        Test() : id(++count) { cout << id; }
        ~Test() { cout << id; --count; }
};
int Test::count = 0;
int main() {
    Test t1;
    {
        Test t2, t3;
    }
    return 0;
}
What is the output?`, '1233211');

  add('error', `class Base {
    int *data;
    public:
        Base(int d) : data(new int(d)) {}
        virtual ~Base() { delete data; }
};
class Derived : public Base {
    int *extra;
    public:
        Derived(int d, int e) : Base(d), extra(new int(e)) {}
        Derived(const Derived &d) : Base(d), extra(new int(*d.extra)) {}
};
int main() {
    Derived d1(10, 20);
    Derived d2 = d1;
    return 0;
}
What is the error?`, 'Derived destructor missing - extra not deleted');

  add('output', `class String {
    char *str;
    public:
        String(const char *s) {
            str = new char[strlen(s) + 1];
            strcpy(str, s);
        }
        String& operator=(const String &s) {
            if(this != &s) {
                delete[] str;
                str = new char[strlen(s.str) + 1];
                strcpy(str, s.str);
            }
            return *this;
        }
        ~String() { delete[] str; }
        void show() { cout << str; }
};
int main() {
    String s1("Hello");
    String s2("World");
    s1 = s2;
    s1.show();
    return 0;
}
What is the output?`, 'World');

  add('output', `class A {
    public:
        virtual void func() { cout << "A"; }
        void process() { func(); }
        A() { process(); }
};
class B : public A {
    public:
        void func() { cout << "B"; }
        B() { process(); }
};
int main() {
    B obj;
    return 0;
}
What is the output?`, 'AB');


  add('output', `class Test {
    int x;
    public:
        Test(int a = 0) : x(a) { cout << x; }
        Test(const Test &t) : x(t.x + t.x) { cout << x; }
        ~Test() { cout << x; }
};
int main() {
    Test t1(2);
    Test t2 = t1;
    return 0;
}
What is the output?`, '2442');

  add('output', `class Base {
    public:
        Base() { cout << "B"; }
        virtual void show() { cout << "b"; }
        virtual ~Base() { show(); }
};
class Derived : public Base {
    public:
        Derived() { show(); }
        void show() { cout << "d"; }
        ~Derived() { show(); }
};
int main() {
    Base *p = new Derived();
    delete p;
    return 0;
}
What is the output?`, 'Bddb');

  add('error', `class Base {
    public:
        virtual void func() const = 0;
};
class Derived : public Base {
    public:
        void func() { cout << "Derived"; }
};
int main() {
    Base *b = new Derived();
    b->func();
    return 0;
}
What is the error?`, 'Derived::func() missing const - doesn\'t override, still abstract');

  add('output', `class Matrix {
    int data[3][3];
    public:
        Matrix() {
            for(int i = 0; i < 3; i++)
                for(int j = 0; j < 3; j++)
                    data[i][j] = i * 3 + j;
        }
        int* operator[](int i) {
            return data[i];
        }
};
int main() {
    Matrix m;
    cout << m[1][1] << m[2][2];
    return 0;
}
What is the output?`, '48');

  add('output', `class A {
    public:
        virtual void func(int x = 3) { cout << x * 2; }
};
class B : public A {
    public:
        void func(int x = 5) { cout << x * 3; }
};
int main() {
    A *p = new B();
    p->func();
    B *q = new B();
    q->func();
    return 0;
}
What is the output?`, '915');

  add('output', `class Test {
    int *ptr;
    public:
        Test(int x) : ptr(new int(x)) { cout << *ptr; }
        Test(const Test &t) : ptr(new int(*t.ptr * 2)) { cout << *ptr; }
        ~Test() { delete ptr; }
};
int main() {
    Test t1(3);
    Test t2 = t1;
    Test t3 = t2;
    return 0;
}
What is the output?`, '3612');

  add('output', `class Counter {
    static int count;
    int id;
    public:
        Counter() : id(++count) { cout << id; }
        Counter(const Counter &c) : id(++count) { cout << id; }
        ~Counter() { cout << id; --count; }
};
int Counter::count = 0;
int main() {
    Counter c1;
    {
        Counter c2 = c1;
        Counter c3;
    }
    return 0;
}
What is the output?`, '1233211');

  add('error', `class Base {
    public:
        virtual void show() const = 0;
};
class Derived : public Base {
    public:
        void show() { cout << "Derived"; }
};
int main() {
    Base *b = new Derived();
    b->show();
    return 0;
}
What is the error?`, 'show() missing const - doesn\'t override, Derived still abstract');

  add('output', `class Complex {
    int real, imag;
    public:
        Complex(int r = 0, int i = 0) : real(r), imag(i) {}
        Complex operator*(Complex c) {
            return Complex(real * c.real - imag * c.imag,
                          real * c.imag + imag * c.real);
        }
        void show() { cout << real << "+" << imag << "i"; }
};
int main() {
    Complex c1(2, 3), c2(4, 5);
    Complex c3 = c1 * c2;
    c3.show();
    return 0;
}
What is the output?`, '-7+22i');

  add('output', `class A {
    protected:
        int x;
    public:
        A(int a) : x(a) { cout << x; }
        virtual void display() { cout << x; }
};
class B : public A {
    int y;
    public:
        B(int a, int b) : A(a), y(b) { cout << y; }
        void display() { cout << x * y; }
};
int main() {
    A *p = new B(3, 4);
    p->display();
    return 0;
}
What is the output?`, '3412');

  add('output', `class Test {
    int val;
    public:
        Test(int v = 0) : val(v) { cout << val; }
        Test& operator++() { val += 2; return *this; }
        Test operator++(int) { Test t = *this; val += 2; return t; }
        int get() { return val; }
};
int main() {
    Test t(5);
    cout << (t++).get();
    cout << (++t).get();
    cout << t.get();
    return 0;
}
What is the output?`, '5599');

  add('output', `class A {
    public:
        A() { cout << "A"; }
        virtual ~A() { cout << "~A"; }
};
class B : public A {
    public:
        B() { cout << "B"; }
        ~B() { cout << "~B"; }
};
class C : public B {
    public:
        C() { cout << "C"; }
        ~C() { cout << "~C"; }
};
class D : public C {
    public:
        D() { cout << "D"; }
        ~D() { cout << "~D"; }
};
int main() {
    A *p = new D();
    delete p;
    return 0;
}
What is the output?`, 'ABCD~D~C~B~A');

  add('error', `class Base {
    public:
        void func() { cout << "Base1"; }
        void func(int x) { cout << "Base2"; }
        virtual void func(double x) { cout << "Base3"; }
};
class Derived : public Base {
    public:
        void func(int x) { cout << "Derived"; }
};
int main() {
    Derived d;
    d.func();
    d.func(3.14);
    return 0;
}
What is the error?`, 'All Base::func versions hidden - compilation errors');

  add('output', `class Node {
    int data;
    Node *next;
    public:
        Node(int d, Node *n = NULL) : data(d), next(n) {}
        void show() { cout << data; }
};
int main() {
    Node n1(10, NULL);
    Node n2(20, &n1);
    n2.show();
    return 0;
}
What is the output?`, '20');

  add('output', `class Test {
    public:
        Test() { cout << "C"; }
        Test(int) { cout << "P"; }
        Test(const Test&) { cout << "CC"; }
        Test& operator=(const Test&) { cout << "="; return *this; }
        ~Test() { cout << "D"; }
};
int main() {
    Test t1;
    Test t2(5);
    t2 = t1;
    return 0;
}
What is the output?`, 'CP=DD');


  add('output', `class A {
    int x;
    public:
        A(int a = 0) : x(a) { cout << x; }
        A(const A &a) : x(a.x * 3) { cout << x; }
        ~A() { cout << x; }
};
int main() {
    A a1(2);
    A a2 = a1;
    A a3(a2);
    return 0;
}
What is the output?`, '26181886622');

  add('output', `class Base1 {
    public:
        Base1() { cout << "1"; }
        virtual ~Base1() { cout << "~1"; }
};
class Base2 {
    public:
        Base2() { cout << "2"; }
        virtual ~Base2() { cout << "~2"; }
};
class Derived : public Base2, public Base1 {
    public:
        Derived() { cout << "D"; }
        ~Derived() { cout << "~D"; }
};
int main() {
    Derived d;
    return 0;
}
What is the output?`, '21D~D~1~2');

  add('error', `class Test {
    static int count;
    public:
        Test() { count++; }
        void display() {
            cout << count;
        }
};
int main() {
    Test t1, t2;
    t1.display();
    return 0;
}
What is the error?`, 'count not initialized');

  add('output', `class List {
    int *arr;
    int size;
    public:
        List(int s) : size(s), arr(new int[s]) {}
        List(const List &l) : size(l.size), arr(new int[l.size]) {
            for(int i = 0; i < size; i++)
                arr[i] = l.arr[i];
        }
        ~List() { delete[] arr; }
        void set(int i, int val) { arr[i] = val; }
        int get(int i) { return arr[i]; }
};
int main() {
    List l(3);
    l.set(0, 10);
    l.set(1, 20);
    cout << l.get(0) + l.get(1);
    return 0;
}
What is the output?`, '30');

  add('output', `class Number {
    int val;
    public:
        Number(int v = 0) : val(v) {}
        Number operator+(Number n) { return Number(val + n.val); }
        Number operator*(Number n) { return Number(val * n.val); }
        friend ostream& operator<<(ostream &o, Number n) {
            o << n.val;
            return o;
        }
};
int main() {
    Number n1(2), n2(3), n3(4);
    cout << n1 + n2 * n3;
    return 0;
}
What is the output?`, '14');

  add('output', `class Test {
    int x;
    public:
        Test(int a = 0) : x(a) { cout << x; }
        void set(int a) { x = a; cout << x; }
        void add(int a) { x += a; cout << x; }
        ~Test() { cout << x; }
};
int main() {
    Test t(5);
    t.set(10);
    t.add(3);
    return 0;
}
What is the output?`, '5101313');

  add('output', `class A {
    public:
        virtual void func() { cout << "A"; }
        A() { func(); }
        ~A() { func(); }
};
class B : public A {
    public:
        void func() { cout << "B"; }
        B() { func(); }
        ~B() { cout << "B"; }
};
int main() {
    A *p = new B();
    delete p;
    return 0;
}
What is the output?`, 'ABBA');

  add('error', `class Shape {
    public:
        virtual double area() = 0;
        virtual double perimeter() = 0;
};
class Circle : public Shape {
    double radius;
    public:
        Circle(double r) : radius(r) {}
        double area() { return 3.14 * radius * radius; }
};
int main() {
    Circle c(5);
    return 0;
}
What is the error?`, 'perimeter() not overridden - Circle still abstract');

  add('output', `class String {
    char *str;
    public:
        String(const char *s = "") {
            str = new char[strlen(s) + 1];
            strcpy(str, s);
        }
        ~String() { delete[] str; }
        void show() { cout << str; }
};
int main() {
    String s("Test");
    s.show();
    return 0;
}
What is the output?`, 'Test');

  add('output', `class Counter {
    static int count;
    int id;
    public:
        Counter() : id(count++) { cout << id; }
        Counter(int x) : id(x) { count = x + 1; cout << id; }
        ~Counter() { cout << id; }
};
int Counter::count = 10;
int main() {
    Counter c1;
    Counter c2(20);
    Counter c3;
    return 0;
}
What is the output?`, '10202121201010');

  // Continue with remaining questions (31-50)
  add('output', `class Base {
    public:
        void show() { cout << "B1"; }
        virtual void display() { cout << "B2"; }
        void print() { show(); display(); }
};
class Derived : public Base {
    public:
        void show() { cout << "D1"; }
        void display() { cout << "D2"; }
};
int main() {
    Base *b = new Derived();
    b->print();
    return 0;
}
What is the output?`, 'B1D2');

  add('output', `class Test {
    int val;
    public:
        Test(int v) : val(v) { cout << val; }
        Test(const Test &t) : val(t.val + t.val + t.val) { cout << val; }
        ~Test() { cout << val; }
};
int main() {
    Test t1(2);
    Test t2 = t1;
    Test t3(t2);
    return 0;
}
What is the output?`, '2618186622');

  add('error', `class Array {
    int *arr;
    int size;
    public:
        Array(int s) : size(s), arr(new int[s]) {}
        ~Array() { delete arr; }
};
What is the error?`, 'Should use delete[] arr');

  add('output', `class Pair {
    int first, second;
    public:
        Pair(int f = 0, int s = 0) : first(f), second(s) {}
        bool operator==(Pair p) {
            return first == p.first && second == p.second;
        }
};
int main() {
    Pair p1(5, 10), p2(5, 10);
    if(p1 == p2)
        cout << "Equal";
    else
        cout << "Not Equal";
    return 0;
}
What is the output?`, 'Equal');

  add('output', `class A {
    public:
        virtual void func() { cout << "A"; }
};
class B : public A {
    public:
        void func() { cout << "B"; }
};
class C : public B {
    public:
        void func() { cout << "C"; }
};
class D : public C {
    public:
        void func() { cout << "D"; }
};
int main() {
    A *arr[4];
    arr[0] = new A();
    arr[1] = new B();
    arr[2] = new C();
    arr[3] = new D();
    for(int i = 0; i < 4; i++)
        arr[i]->func();
    return 0;
}
What is the output?`, 'ABCD');

  add('output', `class Test {
    int x;
    public:
        Test(int a) : x(a) {}
        bool operator>(Test t) { return x > t.x; }
        bool operator<(Test t) { return x < t.x; }
        int get() { return x; }
};
int main() {
    Test t1(15), t2(10), t3(20);
    if(t1 > t2 && t1 < t3)
        cout << t1.get();
    else if(t3 > t1)
        cout << t3.get();
    else
        cout << t2.get();
    return 0;
}
What is the output?`, '15');

  add('output', `class A {
    public:
        A() { cout << "A"; }
        ~A() { cout << "~A"; }
};
class B {
    A a1, a2;
    public:
        B() { cout << "B"; }
        ~B() { cout << "~B"; }
};
int main() {
    B obj;
    return 0;
}
What is the output?`, 'AAB~B~A~A');

  add('error', `class Base {
    public:
        virtual void show() = 0;
        void execute() {
            show();
            cout << "Done";
        }
};
class Derived : public Base {
    public:
        void display() { cout << "Derived"; }
};
int main() {
    Base *b = new Derived();
    b->execute();
    return 0;
}
What is the error?`, 'show() not overridden - Derived still abstract');

  add('output', `class Vector {
    int *data;
    int size;
    public:
        Vector(int s) : size(s), data(new int[s]) {
            for(int i = 0; i < size; i++)
                data[i] = 0;
        }
        ~Vector() { delete[] data; }
        void set(int i, int v) { data[i] = v; }
        int get(int i) { return data[i]; }
};
int main() {
    Vector v(5);
    v.set(2, 42);
    cout << v.get(2);
    return 0;
}
What is the output?`, '42');

  add('output', `class Sample {
    int x;
    public:
        Sample(int a = 1) : x(a) { cout << x; }
        Sample(const Sample &s) : x(s.x + s.x + s.x) { cout << x; }
        ~Sample() { cout << x; }
};
int main() {
    Sample s1(2);
    Sample s2(s1);
    return 0;
}
What is the output?`, '2662');

  add('output', `class Counter {
    int val;
    public:
        Counter(int v = 0) : val(v) {}
        Counter& operator+=(int n) { val += n; return *this; }
        void show() { cout << val; }
};
int main() {
    Counter c(10);
    (c += 5).show();
    (c += 3).show();
    c.show();
    return 0;
}
What is the output?`, '151818');

  add('output', `class Test {
    public:
        Test() { cout << "C"; }
        Test(int x) { cout << "P"; }
        Test(const Test&) { cout << "CC"; }
        ~Test() { cout << "D"; }
};
int main() {
    Test t1;
    Test t2(5);
    Test t3 = t1;
    return 0;
}
What is the output?`, 'CPCCDDD');

  add('error', `class Math {
    public:
        static int add(int a, int b) { return a + b; }
        static int add(double a, double b) { return a + b; }
};
What is the error?`, 'No error (valid function overloading)');

  add('output', `class SmartPtr {
    int *ptr;
    public:
        SmartPtr(int *p) : ptr(p) {}
        ~SmartPtr() { delete ptr; }
        int get() { return *ptr; }
};
int main() {
    SmartPtr p(new int(100));
    cout << p.get();
    return 0;
}
What is the output?`, '100');

  add('output', `class A {
    int x;
    public:
        A(int a) : x(a) { cout << x; }
        virtual void show() { cout << x; }
};
class B : public A {
    int y;
    public:
        B(int a, int b) : A(a), y(b) { cout << y; show(); }
        void show() { cout << y; }
};
int main() {
    B obj(3, 4);
    return 0;
}
What is the output?`, '344');

  add('output', `class Base {
    public:
        virtual void func() { cout << "Base"; }
};
class Derived : public Base {
    public:
        void func() { cout << "Derived"; }
};
int main() {
    Derived d1, d2;
    Base b = d1;
    Base &r = d2;
    b.func();
    r.func();
    return 0;
}
What is the output?`, 'BaseDerived');

  add('output', `class A {
    public:
        A() { cout << "A"; }
        ~A() { cout << "~A"; }
};
int main() {
    A *arr = new A[4];
    delete[] arr;
    return 0;
}
What is the output?`, 'AAAA~A~A~A~A');

  add('error', `class Test {
    int x;
    public:
        Test(int a) : x(a) {}
        void modify() const {
            x = x * 2;
        }
};
What is the error?`, 'Cannot modify x in const function');

  add('output', `class List {
    int *data;
    int size;
    public:
        List(int s) : size(s), data(new int[s]) {}
        int& operator[](int i) {
            return data[i];
        }
        ~List() { delete[] data; }
};
int main() {
    List l(5);
    l[0] = 10;
    l[1] = 20;
    cout << l[0] + l[1];
    return 0;
}
What is the output?`, '30');

  add('output', `class Test {
    static int count;
    public:
        Test() { cout << ++count; }
        Test(const Test&) { cout << ++count; }
        ~Test() { cout << --count; }
};
int Test::count = 10;
int main() {
    Test t1;
    Test t2 = t1;
    Test t3(t2);
    return 0;
}
What is the output?`, '111213121110');

  console.log(`✅ Level 6: ${questions.length} questions prepared`);

  // Seed questions
  console.log('\n💾 Seeding Level 6 questions to database...');
  await adminService.seedQuestions(questions);
  
  console.log('\n🎉 Level 6 seeding completed!');
  console.log(`📊 Questions seeded: ${questions.length}`);

  await app.close();
}

bootstrap().catch(err => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
