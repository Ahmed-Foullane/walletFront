"use client";

import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="dark:bg-gray-900 text-gray-900">
      
      <section className="h-screen flex items-center justify-center dark:bg-gray-900 text-white text-center py-20">
        <div>
          <h1 className="text-5xl font-bold">Welcome to MyWallet</h1>
          <p className="mt-4 text-lg">Your personal finance companion, all in one place.</p>
          <Link to="/register">
            <button className="mt-6 px-6 py-3 bg-indigo-900 text-white font-medium rounded-lg hover:bg-indigo-700 transition">
              Get Started
            </button>
          </Link>
        </div>
      </section>
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-indigo-700 mb-8">Features You'll Love</h2>
          <div className="grid md:grid-cols-3 gap-12">
            <div className="p-6 bg-white rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold mb-4">Track Your Expenses</h3>
              <p className="text-gray-700">
                Easily track all your spending and stay on top of your budget.
              </p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold mb-4">Secure & Private</h3>
              <p className="text-gray-700">
                Your data is securely stored and always kept private.
              </p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold mb-4">Easy Payment History</h3>
              <p className="text-gray-700">
                View and manage all your payment transactions in one place.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="bg-indigo-800 py-16 text-center text-white">
        <h2 className="text-3xl font-semibold mb-4">Ready to take control of your finances?</h2>
        <Link to="/register">
          <button className="px-8 py-4 bg-indigo-900 rounded-lg text-white font-medium hover:bg-indigo-700 transition">
            Sign Up Now
          </button>
        </Link>
      </section>
    </div>
  );
}
