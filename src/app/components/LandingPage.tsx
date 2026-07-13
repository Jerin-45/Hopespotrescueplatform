import { Heart, Users, Shield, MapPin, Clock, CheckCircle, FileText } from 'lucide-react';
import { UserRole } from '../App';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface LandingPageProps {
  onRoleSelect: (role: UserRole) => void;
}

export function LandingPage({ onRoleSelect }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-600 via-red-500 to-orange-500 opacity-90"></div>
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1608723724423-6f60a2fc1a90?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbWVyZ2VuY3klMjByZXNjdWUlMjBoZWxwfGVufDF8fHx8MTc2NDM5Mzg3Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="Emergency rescue"
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay"
        />
        
        <div className="relative z-10 text-center text-white px-4 max-w-4xl">
          <Heart className="w-20 h-20 mx-auto mb-6 animate-pulse" />
          <h1 className="mb-4 text-white">Hope Spot</h1>
          <p className="text-xl mb-2 text-white opacity-95">Because Every Life Matters</p>
          <p className="text-2xl mb-12 text-white">Your safety. Our mission. Immediate help when you need it most.</p>
          
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => onRoleSelect('helper')}
              className="bg-white text-red-600 px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors shadow-lg"
            >
              I Want to Report a Rescue
            </button>
            <button
              onClick={() => onRoleSelect('rescuer')}
              className="bg-red-700 text-white px-8 py-4 rounded-lg hover:bg-red-800 transition-colors shadow-lg border-2 border-white"
            >
              I'm a Rescuer
            </button>
            <button
              onClick={() => onRoleSelect('admin')}
              className="bg-gray-900 text-white px-8 py-4 rounded-lg hover:bg-gray-800 transition-colors shadow-lg"
            >
              Admin Access
            </button>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="mb-4 text-gray-900">Three Users, One Mission: Saving Lives</h2>
            <p className="text-xl text-gray-600">Hope Spot brings together three essential groups to make rescues faster and more reliable.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Helper Card */}
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-center mb-4 text-gray-900">Helper (Reporter)</h3>
              <p className="text-gray-600 mb-6 text-center">Everyday people who witness someone in need and report it.</p>
              
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">Submit a new rescue report</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">Enter name, phone, and location</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">Upload photos of the situation</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">Track the status of reports</span>
                </li>
              </ul>
              
              <button
                onClick={() => onRoleSelect('helper')}
                className="w-full mt-8 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Start as Helper
              </button>
            </div>

            {/* Rescuer Card */}
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border-2 border-red-500">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                <Heart className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-center mb-4 text-gray-900">Rescuer</h3>
              <p className="text-gray-600 mb-6 text-center">Volunteers who physically reach the spot to provide help.</p>
              
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">View active rescue requests</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">Accept cases and mark progress</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">Contact helpers for details</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">Update status in real-time</span>
                </li>
              </ul>
              
              <button
                onClick={() => onRoleSelect('rescuer')}
                className="w-full mt-8 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors"
              >
                Start as Rescuer
              </button>
            </div>

            {/* Admin Card */}
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                <Shield className="w-8 h-8 text-gray-700" />
              </div>
              <h3 className="text-center mb-4 text-gray-900">Administration</h3>
              <p className="text-gray-600 mb-6 text-center">The team that oversees and manages all operations.</p>
              
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-gray-700 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">Review all rescue reports</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-gray-700 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">Verify information accuracy</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-gray-700 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">Assign rescuers to cases</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-gray-700 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">Monitor live progress</span>
                </li>
              </ul>
              
              <button
                onClick={() => onRoleSelect('admin')}
                className="w-full mt-8 bg-gray-800 text-white py-3 rounded-lg hover:bg-gray-900 transition-colors"
              >
                Admin Access
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-center mb-16 text-gray-900">How Hope Spot Works</h2>
          
          <div className="space-y-8">
            <div className="flex gap-6 items-start">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="mb-2 text-gray-900">Helper Submits a Rescue Report</h3>
                <p className="text-gray-600">Provides name, phone number, GPS location, photo, and notes about the situation.</p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="w-12 h-12 bg-red-600 text-white rounded-full flex items-center justify-center flex-shrink-0">
                2
              </div>
              <div>
                <h3 className="mb-2 text-gray-900">Administration Verifies the Report</h3>
                <p className="text-gray-600">Admins validate the report and assign an available rescuer to the case.</p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="w-12 h-12 bg-orange-600 text-white rounded-full flex items-center justify-center flex-shrink-0">
                3
              </div>
              <div>
                <h3 className="mb-2 text-gray-900">Rescuer Takes Action</h3>
                <p className="text-gray-600">The rescuer travels to the location and provides immediate help to the person in need.</p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center flex-shrink-0">
                4
              </div>
              <div>
                <h3 className="mb-2 text-gray-900">Rescue Completed</h3>
                <p className="text-gray-600">Rescuer updates status, admin closes the case, and helper is notified of completion.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-orange-600"></div>
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1763355873417-1e0926397851?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWxwaW5nJTIwaGFuZHMlMjBjb21tdW5pdHl8ZW58MXx8fHwxNzY0MzQ1MDkzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="Helping hands"
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-30"
        />
        
        <div className="relative z-10 max-w-4xl mx-auto text-center text-white">
          <h2 className="mb-6 text-white">Together, We Create Safer Roads</h2>
          <p className="text-xl mb-8 text-white opacity-95">
            Hope Spot ensures no one is left abandoned or unnoticed.
            Every person deserves help, dignity, and safety—especially in moments of crisis.
          </p>
          <div className="space-y-4">
            <p className="text-2xl text-white">Be the reason someone gets help.</p>
            <p className="text-2xl text-white">Be the hope in someone's hardest moment.</p>
          </div>
        </div>
      </div>
    </div>
  );
}