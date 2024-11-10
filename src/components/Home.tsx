import React from 'react';
import { Code, MessageSquare, Zap, ArrowRight } from 'lucide-react';

const LandingPage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 text-white bg-gray-900">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                Code Smarter, Not Harder
              </h1>
              <p className="mx-auto max-w-[700px] md:text-xl">
                Create, generate, and review code in multiple languages with ease. Transform your comments into working code instantly.
              </p>
              <a
                href="/editor"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-gray-100">
          <div className="container mx-auto px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-12 text-gray-900">
              Features that Empower You
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
                <div className="flex items-center mb-4">
                  <MessageSquare className="mr-2 h-6 w-6 text-blue-600" />
                  <h3 className="text-xl font-semibold text-gray-900">Comment-Driven Development</h3>
                </div>
                <p className="text-gray-600">
                  Write comments and watch as they transform into functional code across multiple languages.
                </p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
                <div className="flex items-center mb-4">
                  <Zap className="mr-2 h-6 w-6 text-blue-600" />
                  <h3 className="text-xl font-semibold text-gray-900">Intelligent Suggestions</h3>
                </div>
                <p className="text-gray-600">
                  Get smart code suggestions as you type, boosting your productivity and code quality.
                </p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
                <div className="flex items-center mb-4">
                  <Code className="mr-2 h-6 w-6 text-blue-600" />
                  <h3 className="text-xl font-semibold text-gray-900">Instant Code Reviews</h3>
                </div>
                <p className="text-gray-600">
                  Receive immediate feedback and improvements for your code, enhancing your skills in real-time.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="languages" className="w-full py-12 md:py-24 lg:py-32 bg-gray-50">
          <div className="container mx-auto px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-12 text-gray-900">
              Supported Languages
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-center">
              {['JavaScript', 'Python', 'Java', 'C++', 'Ruby', 'Go', 'Rust', 'TypeScript'].map((lang) => (
                <div key={lang} className="p-4 border rounded-lg bg-white hover:bg-gray-100 transition-colors">
                  <span className="text-gray-800">{lang}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32 text-white bg-gray-900">
          <div className="container mx-auto px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-12">
              How It Works
            </h2>
            <ol className="space-y-4 max-w-2xl mx-auto">
              <li className="flex items-center space-x-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center">1</div>
                <p>Create multiple editors and select your preferred programming language for each.</p>
              </li>
              <li className="flex items-center space-x-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center">2</div>
                <p>Write a comment describing the code you want to generate.</p>
              </li>
              <li className="flex items-center space-x-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center">3</div>
                <p>Press Enter, and watch as your comment is transformed into functional code.</p>
              </li>
              <li className="flex items-center space-x-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center">4</div>
                <p>Receive instant code suggestions and reviews to improve your code quality.</p>
              </li>
            </ol>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-50">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-gray-900">
                Ready to Revolutionize Your Coding?
              </h2>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">
                Join thousands of developers who are already coding smarter with CodeGenius.
              </p>
              <a
                href="/editor"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Start Coding Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default LandingPage;