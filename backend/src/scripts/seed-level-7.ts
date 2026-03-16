import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { AdminService } from '../admin/admin.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const adminService = app.get(AdminService);

  console.log('🚀 Seeding Level 7 (50 questions)...\n');

  const questions = [];
  const level = 7;
  let questionId = 701; // Starting from 701 for Level 7

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

  // Level 7 - 50 Questions
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
class D : public C {
    int w;
    public:
        D(int a, int b, int c, int d) : C(a, b, c), w(d) { cout << w; }
        ~D() { cout << w; }
};
int main() {
    A *p = new D(1, 2, 3, 4);
    delete p;
    return 0;
}
What is the output?`, '1234~4~3~3~2~2~1~1');

  add('mcq', `class Base {
    public:
        void func() { cout << "B1"; }
        void func(int x) { cout << "B2"; }
};
class Derived : public Base {
    public:
        void func() { cout << "D"; }
};
What happens when Derived d; d.func(5); is called?`, 'Compilation error - func(int) is hidden', 
    ['Outputs "B2"', 'Outputs "D"', 'Compilation error - func(int) is hidden', 'Calls both B2 and D']);

  add('error', `class Base {
    int *data;
    public:
        Base(int d) : data(new int(d)) {}
        Base(const Base &b) : data(new int(*b.data)) {}
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
What is the error?`, 'Derived destructor missing - extra not deleted, memory leak');

  add('output', `class String {
    char *str;
    public:
        String(const char *s = "") {
            str = new char[strlen(s) + 1];
            strcpy(str, s);
        }
        String(const String &s) {
            str = new char[strlen(s.str) + 1];
            strcpy(str, s.str);
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
    String s2 = s1;
    String s3("World");
    s1 = s3;
    s1.show();
    return 0;
}
What is the output?`, 'World');

  add('mcq', `class A {
    public:
        virtual void func(int x = 10) { cout << x; }
};
class B : public A {
    public:
        void func(int x = 20) { cout << x * 2; }
};
What is output of: A *p = new B(); p->func();`, '20', 
    ['10', '20', '40', 'Compilation error']);

  add('output', `class Test {
    int x;
    public:
        Test(int a = 0) : x(a) { cout << x; }
        Test(const Test &t) : x(t.x * t.x) { cout << x; }
        ~Test() { cout << x; }
};
int main() {
    Test t1(3);
    Test t2 = t1;
    Test t3 = t2;
    return 0;
}
What is the output?`, '39818181993');

  add('mcq', `class Base {
    public:
        Base() { func(); }
        virtual void func() { cout << "Base"; }
};
class Derived : public Base {
    public:
        Derived() { func(); }
        void func() { cout << "Derived"; }
};
What is output of: Derived d;`, 'BaseDerived', 
    ['BaseDerived', 'DerivedDerived', 'BaseBase', 'DerivedBase']);

  add('output', `class Base {
    public:
        Base() { cout << "B"; }
        virtual void show() { cout << "b"; }
        virtual void display() { cout << "d"; }
        virtual ~Base() { show(); display(); }
};
class Derived : public Base {
    public:
        Derived() { show(); display(); }
        void show() { cout << "s"; }
        void display() { cout << "p"; }
        ~Derived() { show(); display(); }
};
int main() {
    Base *p = new Derived();
    delete p;
    return 0;
}
What is the output?`, 'Bspspbd');

  add('error', `class A {
    public:
        int x;
        A() { x = 5; }
};
class B : public A {
    public:
        int y;
        B() { y = 10; }
};
class C : public A {
    public:
        int z;
        C() { z = 15; }
};
class D : public B, public C {
    public:
        void show() {
            cout << x;
        }
};
int main() {
    D obj;
    obj.show();
    return 0;
}
What is the error?`, 'Ambiguous x - must use B::x or C::x');

  add('mcq', `class Test {
    int *ptr;
    public:
        Test(int x) : ptr(new int(x)) {}
        ~Test() { delete ptr; }
};
What problem occurs with: Test t1(5); Test t2 = t1;`, 'Double deletion of ptr', 
    ['No problem', 'Double deletion of ptr', 'Memory leak', 'Compilation error']);

  add('output', `class Matrix {
    int **data;
    int rows, cols;
    public:
        Matrix(int r, int c) : rows(r), cols(c) {
            data = new int*[rows];
            for(int i = 0; i < rows; i++)
                data[i] = new int[cols];
        }
        ~Matrix() {
            for(int i = 0; i < rows; i++)
                delete[] data[i];
            delete[] data;
        }
        int*& operator[](int i) {
            return data[i];
        }
};
int main() {
    Matrix m(3, 3);
    m[0][0] = 5;
    m[1][1] = 10;
    cout << m[0][0] + m[1][1];
    return 0;
}
What is the output?`, '15');

  add('mcq', `class Base {
    public:
        virtual void show() const { cout << "Base"; }
};
class Derived : public Base {
    public:
        void show() { cout << "Derived"; }
};
What happens with: const Base *b = new Derived(); b->show();`, 'Outputs "Base"', 
    ['Outputs "Derived"', 'Outputs "Base"', 'Compilation error', 'Runtime error']);

  add('output', `class A {
    public:
        virtual void func(int x = 2) { cout << x * x; }
};
class B : public A {
    public:
        void func(int x = 3) { cout << x * x * x; }
};
class C : public B {
    public:
        void func(int x = 4) { cout << x * x * x * x; }
};
int main() {
    A *p1 = new B();
    A *p2 = new C();
    p1->func();
    p2->func();
    return 0;
}
What is the output?`, '816');

  add('mcq', `class Sample {
    static int count;
    public:
        Sample() { count++; }
        ~Sample() { count--; }
};
If count is NOT initialized outside the class, what happens?`, 'Linker error', 
    ['count defaults to 0', 'Linker error', 'count is randomly initialized', 'Compilation warning only']);

  add('output', `class Test {
    int *ptr;
    public:
        Test(int x) : ptr(new int(x)) { cout << *ptr; }
        Test(const Test &t) : ptr(new int(*t.ptr + *t.ptr)) { cout << *ptr; }
        ~Test() { delete ptr; }
};
int main() {
    Test t1(2);
    Test t2 = t1;
    Test t3 = t2;
    Test t4 = t3;
    return 0;
}
What is the output?`, '24816');

  add('mcq', `class Array {
    int *arr;
    public:
        Array(int s) : arr(new int[s]) {}
        ~Array() { delete arr; }
};
What is wrong with this destructor?`, 'Should use delete[] arr', 
    ['Nothing wrong', 'Should use delete[] arr', 'Should use free(arr)', 'Memory leak - nothing deleted']);

  add('output', `class Counter {
    static int count;
    int id;
    public:
        Counter() : id(++count) { cout << id; }
        Counter(const Counter &c) : id(++count) { cout << id; }
        ~Counter() { cout << id; count--; }
};
int Counter::count = 0;
int main() {
    Counter c1;
    {
        Counter c2 = c1;
        {
            Counter c3 = c2;
        }
    }
    return 0;
}
What is the output?`, '12332211');

  add('error', `class Base {
    public:
        virtual void show() const = 0;
        virtual void display() const = 0;
};
class Derived : public Base {
    public:
        void show() const { cout << "Show"; }
        void display() { cout << "Display"; }
};
int main() {
    Base *b = new Derived();
    b->show();
    b->display();
    return 0;
}
What is the error?`, 'display() missing const - doesn\'t override, Derived still abstract');

  add('mcq', `class A {
    public:
        void func() { cout << "A1"; }
        virtual void func(int x) { cout << "A2"; }
};
class B : public A {
    public:
        void func(int x) { cout << "B"; }
};
What happens with: B obj; obj.func();`, 'Compilation error', 
    ['Outputs "A1"', 'Outputs "B"', 'Compilation error', 'Runtime error']);

  add('output', `class Complex {
    double real, imag;
    public:
        Complex(double r = 0, double i = 0) : real(r), imag(i) {}
        Complex operator/(Complex c) {
            double denom = c.real * c.real + c.imag * c.imag;
            return Complex((real * c.real + imag * c.imag) / denom,
                          (imag * c.real - real * c.imag) / denom);
        }
        void show() { cout << (int)real << "+" << (int)imag << "i"; }
};
int main() {
    Complex c1(10, 8), c2(2, 4);
    Complex c3 = c1 / c2;
    c3.show();
    return 0;
}
What is the output?`, '2+0i');

  add('mcq', `class Base {
    public:
        ~Base() { cout << "~Base"; }
};
class Derived : public Base {
    public:
        ~Derived() { cout << "~Derived"; }
};
What happens with: Base *b = new Derived(); delete b;`, 'Outputs "~Base" only', 
    ['Outputs "~Derived~Base"', 'Outputs "~Base" only', 'Outputs "~Derived" only', 'Compilation error']);

  add('output', `class A {
    protected:
        int x;
    public:
        A(int a) : x(a) { cout << x; }
        virtual void compute() { cout << x * 2; }
};
class B : public A {
    int y;
    public:
        B(int a, int b) : A(a), y(b) { cout << y; compute(); }
        void compute() { cout << x + y; }
};
class C : public B {
    int z;
    public:
        C(int a, int b, int c) : B(a, b), z(c) { cout << z; compute(); }
        void compute() { cout << x + y + z; }
};
int main() {
    A *p = new C(2, 3, 4);
    p->compute();
    return 0;
}
What is the output?`, '235499');

  add('mcq', `class Test {
    public:
        Test() { cout << "C"; }
        Test(const Test&) { cout << "CC"; }
        ~Test() { cout << "D"; }
};
What is output of: Test t1; Test t2 = t1;`, 'CCCDD', 
    ['CCD', 'CCCD', 'CCDD', 'CCCDD']);

  add('output', `class Test {
    int val;
    public:
        Test(int v = 0) : val(v) { cout << val; }
        Test& operator+=(int n) { val += n; return *this; }
        Test operator+(int n) { return Test(val + n); }
        ~Test() { cout << val; }
};
int main() {
    Test t(5);
    (t += 3);
    Test t2 = t + 2;
    return 0;
}
What is the output?`, '510108');

  add('mcq', `class Calculator {
    public:
        int add(int a, int b) { return a + b; }
        double add(int a, int b) { return a + b; }
};
What happens with this code?`, 'Compilation error - cannot overload only on return type', 
    ['Works fine, overloading based on return type', 'Compilation error - cannot overload only on return type', 'Runtime error', 'Second function overrides first']);

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
class E : public D {
    public:
        E() { cout << "E"; }
        ~E() { cout << "~E"; }
};
int main() {
    A *p = new E();
    delete p;
    return 0;
}
What is the output?`, 'ABCDE~E~D~C~B~A');

  add('error', `class Base {
    public:
        void func() { cout << "Base1"; }
        void func(int x) { cout << "Base2"; }
        virtual void func(double x) { cout << "Base3"; }
        void func(int x, int y) { cout << "Base4"; }
};
class Derived : public Base {
    public:
        void func(int x) { cout << "Derived"; }
};
int main() {
    Derived d;
    d.func();
    d.func(5, 10);
    return 0;
}
What is the error?`, 'All Base::func versions hidden - compilation errors');

  add('mcq', `class Shape {
    public:
        virtual double area() = 0;
};
class Circle : public Shape {
    public:
        Circle() {}
};
What happens with: Circle c;`, 'Compilation error - Circle still abstract', 
    ['Works fine', 'Compilation error - Circle still abstract', 'Runtime error', 'Memory leak']);

  add('output', `class List {
    struct Node {
        int data;
        Node *next;
        Node(int d, Node *n = NULL) : data(d), next(n) {}
    };
    Node *head;
    public:
        List() : head(NULL) {}
        void add(int d) { head = new Node(d, head); }
        void show() { 
            Node *temp = head;
            while(temp) {
                cout << temp->data;
                temp = temp->next;
            }
        }
        ~List() {
            while(head != NULL) {
                Node *temp = head;
                head = head->next;
                delete temp;
            }
        }
};
int main() {
    List l;
    l.add(1);
    l.add(2);
    l.add(3);
    l.show();
    return 0;
}
What is the output?`, '321');

  add('mcq', `class Base {
    protected:
        int x;
    public:
        Base(int a) : x(a) {}
};
class Derived : private Base {
    public:
        Derived(int a) : Base(a) {}
};
What happens with: Derived d(10); Base *b = &d;`, 'Compilation error - cannot convert to Base* with private inheritance', 
    ['Works fine', 'Compilation error - cannot convert to Base* with private inheritance', 'Runtime error', 'x becomes private']);

  add('output', `class Test {
    public:
        Test() { cout << "C"; }
        Test(int x) { cout << "P" << x; }
        Test(const Test&) { cout << "CC"; }
        Test& operator=(const Test&) { cout << "="; return *this; }
        ~Test() { cout << "D"; }
};
int main() {
    Test t1;
    Test t2(3);
    Test t3 = t1;
    t2 = t3;
    return 0;
}
What is the output?`, 'CP3CC=DDD');

  add('mcq', `class A {
    int x;
    public:
        A(int a) : x(a) {}
        void show() const {
            x = 10;
            cout << x;
        }
};
What's wrong with this code?`, 'Cannot modify x in const function', 
    ['Nothing', 'Cannot modify x in const function', 'x is private', 'Missing destructor']);

  add('output', `class A {
    int x;
    public:
        A(int a = 0) : x(a) { cout << x; }
        A(const A &a) : x(a.x * a.x * a.x) { cout << x; }
        ~A() { cout << x; }
};
int main() {
    A a1(2);
    A a2 = a1;
    A a3(a2);
    return 0;
}
What is the output?`, '28512512512882');

  add('mcq', `class Test {
    public:
        Test(int x) { cout << "C"; }
};
What happens with: Test t;`, 'Compilation error - no default constructor', 
    ['Outputs "C"', 'Compilation error - no default constructor', 'Calls default constructor', 'Runtime error']);

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
class Base3 {
    public:
        Base3() { cout << "3"; }
        virtual ~Base3() { cout << "~3"; }
};
class Derived : public Base1, public Base2, public Base3 {
    public:
        Derived() { cout << "D"; }
        ~Derived() { cout << "~D"; }
};
int main() {
    Derived d;
    return 0;
}
What is the output?`, '123D~D~3~2~1');

  add('error', `class Test {
    static int count;
    public:
        Test() { count++; }
        ~Test() { count--; }
        void display() {
            cout << count;
        }
};
int main() {
    Test t1, t2, t3;
    t1.display();
    return 0;
}
What is the error?`, 'count not initialized');

  add('output', `class Matrix {
    int **data;
    int rows, cols;
    public:
        Matrix(int r, int c) : rows(r), cols(c) {
            data = new int*[rows];
            for(int i = 0; i < rows; i++) {
                data[i] = new int[cols];
                for(int j = 0; j < cols; j++)
                    data[i][j] = 0;
            }
        }
        ~Matrix() {
            for(int i = 0; i < rows; i++)
                delete[] data[i];
            delete[] data;
        }
        int*& operator[](int i) { return data[i]; }
};
int main() {
    Matrix m(2, 2);
    m[0][0] = 5;
    m[1][1] = 10;
    cout << m[0][0] * m[1][1];
    return 0;
}
What is the output?`, '50');

  add('mcq', `class A {
    public:
        virtual void func() { cout << "A"; }
};
class B : public A {
    public:
        void func() { cout << "B"; }
};
What is output of: B b; A a = b; a.func();`, 'Outputs "A"', 
    ['Outputs "B"', 'Outputs "A"', 'Compilation error', 'Runtime error']);

  add('output', `class Number {
    int val;
    public:
        Number(int v = 0) : val(v) {}
        Number operator+(Number n) { return Number(val + n.val); }
        Number operator*(Number n) { return Number(val * n.val); }
        Number operator-(Number n) { return Number(val - n.val); }
        friend ostream& operator<<(ostream &o, Number n) {
            o << n.val;
            return o;
        }
};
int main() {
    Number n1(5), n2(3), n3(2);
    cout << (n1 + n2) * n3 - n3;
    return 0;
}
What is the output?`, '14');

  add('mcq', `class Sample {
    int x;
    public:
        Sample(int a) : x(a) {}
        Sample operator+(int n) { return Sample(x + n); }
};
What happens with: Sample s(5); Sample s2 = 10 + s;`, 'Compilation error - no matching operator', 
    ['Works fine', 'Compilation error - no matching operator', 'Outputs 15', 'Runtime error']);

  add('output', `class Test {
    int x;
    public:
        Test(int a = 0) : x(a) { cout << x; }
        void modify(int a) { x = a; cout << x; }
        void add(int a) { x += a; cout << x; }
        void multiply(int a) { x *= a; cout << x; }
        ~Test() { cout << x; }
};
int main() {
    Test t(2);
    t.add(3);
    t.multiply(4);
    return 0;
}
What is the output?`, '2520020');

  add('mcq', `class Node {
    int *data;
    public:
        Node(int d) : data(new int(d)) {}
        ~Node() { delete data; }
};
What problem occurs with: Node n1(5); Node n2 = n1; Node n3; n3 = n1;`, 'Triple deletion of data', 
    ['No problem', 'Triple deletion of data', 'Memory leak', 'Compilation error']);

  add('output', `class A {
    public:
        virtual void func() { cout << "A"; }
        void process() { func(); }
        A() { process(); }
        virtual ~A() { process(); }
};
class B : public A {
    public:
        void func() { cout << "B"; }
        B() { process(); }
        ~B() { process(); }
};
class C : public B {
    public:
        void func() { cout << "C"; }
        C() { process(); }
        ~C() { process(); }
};
int main() {
    B *p = new C();
    p->process();
    delete p;
    return 0;
}
What is the output?`, 'ABCCCBA');

  add('error', `class Figure {
    public:
        virtual double area() = 0;
        virtual double perimeter() = 0;
        virtual void draw() = 0;
};
class Rectangle : public Figure {
    double length, width;
    public:
        Rectangle(double l, double w) : length(l), width(w) {}
        double area() { return length * width; }
        double perimeter() { return 2 * (length + width); }
};
int main() {
    Rectangle r(5, 3);
    return 0;
}
What is the error?`, 'draw() not overridden - Rectangle still abstract');

  add('output', `class String {
    char *str;
    public:
        String(const char *s = "") {
            str = new char[strlen(s) + 1];
            strcpy(str, s);
        }
        String operator+(const String &s) {
            String temp;
            delete[] temp.str;
            temp.str = new char[strlen(str) + strlen(s.str) + 1];
            strcpy(temp.str, str);
            strcat(temp.str, s.str);
            return temp;
        }
        ~String() { delete[] str; }
        void show() { cout << str; }
};
int main() {
    String s1("Hello");
    String s2(" World");
    String s3 = s1 + s2;
    s3.show();
    return 0;
}
What is the output?`, 'Hello World');

  add('mcq', `class A {
    public:
        int x;
        A() { x = 10; }
};
class B : virtual public A {};
class C : virtual public A {};
class D : public B, public C {};
What is value of D obj; cout << obj.x;`, '10', 
    ['Compilation error - ambiguous', '10', '20', 'Undefined']);

  add('output', `class Counter {
    static int count;
    int id;
    public:
        Counter() : id(count) { count += 2; cout << id; }
        Counter(int x) : id(x) { count = x + 3; cout << id; }
        ~Counter() { cout << id; }
};
int Counter::count = 5;
int main() {
    Counter c1;
    Counter c2(10);
    Counter c3;
    return 0;
}
What is the output?`, '5101313105');

  add('mcq', `class Test {
    public:
        Test() { cout << "C"; }
        Test(int, int) { cout << "P"; }
};
What happens with: Test t(5);`, 'Compilation error - no matching constructor', 
    ['Outputs "C"', 'Outputs "P"', 'Compilation error - no matching constructor', 'Runtime error']);

  add('output', `class Base {
    public:
        void func1() { cout << "B1"; }
        virtual void func2() { cout << "B2"; }
        void execute() { func1(); func2(); }
};
class Derived : public Base {
    public:
        void func1() { cout << "D1"; }
        void func2() { cout << "D2"; }
};
int main() {
    Base *b1 = new Base();
    Base *b2 = new Derived();
    b1->execute();
    b2->execute();
    return 0;
}
What is the output?`, 'B1B2B1D2');

  add('mcq', `class A {
    int x;
    public:
        A(int a) : x(a) {}
};
class B : public A {
    public:
        B(int a) { x = a; }
};
What's wrong with class B?`, 'Base class constructor not called, x is uninitialized then reassigned', 
    ['Nothing', 'Base class constructor not called, x is uninitialized then reassigned', 'x is private', 'Missing destructor']);

  console.log(`✅ Level 7: ${questions.length} questions prepared`);
  console.log('\n💾 Seeding Level 7 questions to database...');
  await adminService.seedQuestions(questions);
  
  console.log('\n🎉 Level 7 seeding completed!');
  console.log(`📊 Questions seeded: ${questions.length}`);

  await app.close();
}

bootstrap().catch(err => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
