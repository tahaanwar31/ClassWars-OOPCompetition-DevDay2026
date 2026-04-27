import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Question, QuestionDocument } from '../../../schemas/question.schema';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectModel(Question.name) private questionModel: Model<QuestionDocument>,
  ) {}

  async getQuestionsByLevel(level: number, roundKey: string = 'round1'): Promise<Question[]> {
    return this.questionModel.find({ level, roundKey, isActive: true }).exec();
  }

  async getQuestionById(id: number): Promise<Question> {
    const question = await this.questionModel.findOne({ id, isActive: true }).exec();
    if (!question) throw new NotFoundException('Question not found');
    return question;
  }

  async getRandomQuestion(level: number, roundKey: string = 'round1'): Promise<Question> {
    const questions = await this.getQuestionsByLevel(level, roundKey);
    if (questions.length === 0) {
      const maxLevel = await this.questionModel.findOne({ roundKey }).sort('-level').exec();
      if (maxLevel && level > maxLevel.level) {
        return this.getRandomQuestion(maxLevel.level, roundKey);
      }
      throw new Error('No questions available');
    }
    return questions[Math.floor(Math.random() * questions.length)];
  }

  async getAllQuestions(): Promise<Question[]> {
    return this.questionModel.find().exec();
  }

  async createQuestion(questionData: Partial<Question>): Promise<Question> {
    const question = new this.questionModel(questionData);
    return question.save();
  }

  async updateQuestion(id: string, questionData: Partial<Question>): Promise<Question> {
    return this.questionModel.findByIdAndUpdate(id, questionData, { new: true }).exec();
  }

  async deleteQuestion(id: string): Promise<void> {
    await this.questionModel.findByIdAndDelete(id).exec();
  }

  async seedQuestions(questions: Partial<Question>[]): Promise<void> {
    await this.questionModel.deleteMany({});
    await this.questionModel.insertMany(questions);
  }
}
