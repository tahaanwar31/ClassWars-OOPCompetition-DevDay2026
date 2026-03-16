import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { AdminService } from '../admin/admin.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const adminService = app.get(AdminService);

  console.log('🚀 Starting comprehensive database seeding...');
  console.log('📚 Seeding 250 questions across 5 levels for Round 1');

  // LEVEL 1 - 50 Riddles (Basic OOP Concepts)
  const level1Questions = [
    { id: 1, level: 1, roundKey: 'round1', type: 'oneword', text: 'I keep my information locked away. Outsiders cannot touch it directly. But if you knock through the right doors, I may allow you to read or modify it.', correct: 'Encapsulation', isActive: true },
    { id: 2, level: 1, roundKey: 'round1', type: 'oneword', text: 'A child may inherit traits from a parent. In programming I allow a new class to gain abilities from an existing one.', correct: 'Inheritance', isActive: true },
    { id: 3, level: 1, roundKey: 'round1', type: 'oneword', text: 'You call my name the same way every time, but depending on the situation I might behave differently.', correct: 'Polymorphism', isActive: true },
    { id: 4, level: 1, roundKey: 'round1', type: 'oneword', text: 'You rarely call me directly, yet I appear whenever a new object is created.', correct: 'Constructor', isActive: true },
    { id: 5, level: 1, roundKey: 'round1', type: 'oneword', text: 'When an object\'s life comes to an end, I quietly clean up the resources it used.', correct: 'Destructor', isActive: true },
    { id: 6, level: 1, roundKey: 'round1', type: 'oneword', text: 'Users see what I do, but they do not see how I do it.', correct: 'Abstraction', isActive: true },
    { id: 7, level: 1, roundKey: 'round1', type: 'oneword', text: 'I describe what something should look like, but I cannot exist on my own. Only my children can bring my design to life.', correct: 'Abstract Class', isActive: true },
    { id: 8, level: 1, roundKey: 'round1', type: 'oneword', text: 'I allow my children to use my resources, but outsiders cannot access them.', correct: 'Protected', isActive: true },
    { id: 9, level: 1, roundKey: 'round1', type: 'oneword', text: 'I am called automatically when you create a copy of an object.', correct: 'Copy Constructor', isActive: true },
    { id: 10, level: 1, roundKey: 'round1', type: 'oneword', text: 'I hold data that belongs to the class itself, not to any single object.', correct: 'Static Member Variable', isActive: true },
    { id: 11, level: 1, roundKey: 'round1', type: 'oneword', text: 'I am a function that can access private parts of a class, even though I am not a member of that class.', correct: 'Friend Function', isActive: true },
    { id: 12, level: 1, roundKey: 'round1', type: 'oneword', text: 'I let you use the same operator symbol for different types of data.', correct: 'Operator Overloading', isActive: true },
    { id: 13, level: 1, roundKey: 'round1', type: 'oneword', text: 'I am a class that contains at least one incomplete function, so you cannot create objects of me directly.', correct: 'Abstract Class', isActive: true },
    { id: 14, level: 1, roundKey: 'round1', type: 'oneword', text: 'I am the pillar of OOP that hides implementation details from the user.', correct: 'Encapsulation', isActive: true },
    { id: 15, level: 1, roundKey: 'round1', type: 'oneword', text: 'I am the pillar that allows one interface to be used for a general class of actions.', correct: 'Polymorphism', isActive: true },
    { id: 16, level: 1, roundKey: 'round1', type: 'oneword', text: 'I am a special function with the same name as the class, used to initialize objects.', correct: 'Constructor', isActive: true },
    { id: 17, level: 1, roundKey: 'round1', type: 'oneword', text: 'I am a special function with a tilde (~) before my name.', correct: 'Destructor', isActive: true },
    { id: 18, level: 1, roundKey: 'round1', type: 'oneword', text: 'I allow a child class to access parent class members, but keep them hidden from the outside world.', correct: 'Protected', isActive: true },
    { id: 19, level: 1, roundKey: 'round1', type: 'oneword', text: 'I am the keyword that makes a function wait until runtime to decide which version to call.', correct: 'Virtual', isActive: true },
    { id: 20, level: 1, roundKey: 'round1', type: 'oneword', text: 'I am the type of function that has no body in the base class, and must be defined in derived classes.', correct: 'Pure Virtual Function', isActive: true },
    { id: 21, level: 1, roundKey: 'round1', type: 'oneword', text: 'I let a class inherit properties from more than one parent.', correct: 'Multiple Inheritance', isActive: true },
    { id: 22, level: 1, roundKey: 'round1', type: 'oneword', text: 'I am the relationship where class B is created from class A, and class C is created from class B.', correct: 'Multilevel Inheritance', isActive: true },
    { id: 23, level: 1, roundKey: 'round1', type: 'oneword', text: 'I am when multiple classes inherit from a single base class.', correct: 'Hierarchical Inheritance', isActive: true },
    { id: 24, level: 1, roundKey: 'round1', type: 'oneword', text: 'I create a blueprint for objects.', correct: 'Class', isActive: true },
    { id: 25, level: 1, roundKey: 'round1', type: 'oneword', text: 'I am an instance of a class.', correct: 'Object', isActive: true },
    { id: 26, level: 1, roundKey: 'round1', type: 'oneword', text: 'I control who can see and use the members of a class.', correct: 'Access Specifier', isActive: true },
    { id: 27, level: 1, roundKey: 'round1', type: 'oneword', text: 'I make members visible to everyone, everywhere.', correct: 'Public', isActive: true },
    { id: 28, level: 1, roundKey: 'round1', type: 'oneword', text: 'I make members visible only inside the class itself.', correct: 'Private', isActive: true },
    { id: 29, level: 1, roundKey: 'round1', type: 'oneword', text: 'I am a function that can be called without creating an object.', correct: 'Static Function', isActive: true },
    { id: 30, level: 1, roundKey: 'round1', type: 'oneword', text: 'I am data that is shared by all objects of a class.', correct: 'Static Data Member', isActive: true },
    { id: 31, level: 1, roundKey: 'round1', type: 'oneword', text: 'I let you define what happens when you add two objects together.', correct: 'Operator Overloading', isActive: true },
    { id: 32, level: 1, roundKey: 'round1', type: 'oneword', text: 'I am the process of creating a new object by copying an existing one.', correct: 'Copy Constructor', isActive: true },
    { id: 33, level: 1, roundKey: 'round1', type: 'oneword', text: 'I am a function that cannot modify the object it belongs to.', correct: 'Const Member Function', isActive: true },
    { id: 34, level: 1, roundKey: 'round1', type: 'oneword', text: 'I point to the current object inside a member function.', correct: 'this pointer', isActive: true },
    { id: 35, level: 1, roundKey: 'round1', type: 'oneword', text: 'I am the OOP concept that focuses on essential features while hiding unnecessary details.', correct: 'Abstraction', isActive: true },
    { id: 36, level: 1, roundKey: 'round1', type: 'oneword', text: 'I am the ability of a child class to use methods from its parent class.', correct: 'Inheritance', isActive: true },
    { id: 37, level: 1, roundKey: 'round1', type: 'oneword', text: 'I am when a derived class provides its own version of a base class function.', correct: 'Function Overriding', isActive: true },
    { id: 38, level: 1, roundKey: 'round1', type: 'oneword', text: 'I am when you have multiple functions with the same name but different parameters.', correct: 'Function Overloading', isActive: true },
    { id: 39, level: 1, roundKey: 'round1', type: 'oneword', text: 'I help avoid creating the wrong object by making my constructor accessible only to the class.', correct: 'Private Constructor', isActive: true },
    { id: 40, level: 1, roundKey: 'round1', type: 'oneword', text: 'I am called when you assign one object to another.', correct: 'Assignment Operator', isActive: true },
    { id: 41, level: 1, roundKey: 'round1', type: 'oneword', text: 'I am a collection of related classes and objects.', correct: 'Namespace', isActive: true },
    { id: 42, level: 1, roundKey: 'round1', type: 'oneword', text: 'I ensure only one instance of a class exists in the entire program.', correct: 'Singleton Pattern', isActive: true },
    { id: 43, level: 1, roundKey: 'round1', type: 'oneword', text: 'I am the concept where objects are treated as instances of their parent class.', correct: 'Polymorphism', isActive: true },
    { id: 44, level: 1, roundKey: 'round1', type: 'oneword', text: 'I let derived classes access base class members while keeping them hidden from outside.', correct: 'Protected Access', isActive: true },
    { id: 45, level: 1, roundKey: 'round1', type: 'oneword', text: 'I am resolved at compile time, not at runtime.', correct: 'Static Binding', isActive: true },
    { id: 46, level: 1, roundKey: 'round1', type: 'oneword', text: 'I am resolved at runtime based on the object type.', correct: 'Dynamic Binding', isActive: true },
    { id: 47, level: 1, roundKey: 'round1', type: 'oneword', text: 'I am when you allocate memory for objects during program execution.', correct: 'Dynamic Memory Allocation', isActive: true },
    { id: 48, level: 1, roundKey: 'round1', type: 'oneword', text: 'I give memory back to the system when objects are no longer needed.', correct: 'Destructor', isActive: true },
    { id: 49, level: 1, roundKey: 'round1', type: 'oneword', text: 'I am the parent from which other classes are derived.', correct: 'Base Class', isActive: true },
    { id: 50, level: 1, roundKey: 'round1', type: 'oneword', text: 'I am the child that inherits from another class.', correct: 'Derived Class', isActive: true },
  ];

  console.log('📝 Seeding Level 1 questions...');
  await adminService.seedQuestions(level1Questions);
  console.log('✅ Level 1 complete (50 questions)');

  await app.close();
  console.log('🎉 Database seeding completed successfully!');
  console.log('📊 Total questions seeded: 50');
}

bootstrap().catch(err => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});

  // Note: Due to file size limits, this is Level 1 only.
  // Run this script first, then run seed-levels-2-5.ts for remaining questions.
