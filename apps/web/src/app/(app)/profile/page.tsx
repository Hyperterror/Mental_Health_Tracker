"use client";
import React from 'react';

export default function ProfilePage() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <header className="mb-10 text-center">
        <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 mx-auto mb-6 shadow-xl flex items-center justify-center text-white text-5xl font-bold border-4 border-white">
          JD
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">John Doe</h1>
        <p className="text-gray-500 mt-2 font-medium">Student • Level 5 Scholar</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold mb-6 text-gray-800 border-b pb-4">Personal Details</h2>
          <div className="space-y-4 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Email</span>
              <span className="font-medium text-gray-900">john.doe@example.com</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Member Since</span>
              <span className="font-medium text-gray-900">September 2025</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">School</span>
              <span className="font-medium text-gray-900">University of Excellence</span>
            </div>
          </div>
          <button className="w-full mt-8 py-3 bg-gray-50 text-gray-700 rounded-xl font-medium hover:bg-gray-100 transition-colors">
            Edit Profile
          </button>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold mb-6 text-gray-800 border-b pb-4">Preferences</h2>
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-900 text-sm">Dark Mode</p>
                <p className="text-xs text-gray-500 mt-0.5">Toggle dark theme</p>
              </div>
              <div className="w-12 h-6 bg-gray-200 rounded-full relative cursor-pointer hover:bg-gray-300 transition-colors">
                <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5 shadow"></div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-900 text-sm">Email Notifications</p>
                <p className="text-xs text-gray-500 mt-0.5">Weekly reports & alerts</p>
              </div>
              <div className="w-12 h-6 bg-indigo-500 rounded-full relative cursor-pointer hover:bg-indigo-600 transition-colors">
                <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5 shadow"></div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-900 text-sm">Focus Sounds</p>
                <p className="text-xs text-gray-500 mt-0.5">Play ambient noise</p>
              </div>
              <div className="w-12 h-6 bg-indigo-500 rounded-full relative cursor-pointer hover:bg-indigo-600 transition-colors">
                <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5 shadow"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="text-center pt-8">
        <button className="px-6 py-2 text-red-500 font-medium hover:bg-red-50 rounded-xl transition-colors">
          Sign Out
        </button>
      </div>
    </div>
  );
}
