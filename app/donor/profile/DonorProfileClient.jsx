"use client"

import React, { useState } from 'react';
import { User, Heart, Calendar, DollarSign, Award, TrendingUp, Edit, Mail, Phone, MapPin } from 'lucide-react';
import { signOut } from '@/app/utils/action';
import Image from 'next/image';

const DonorProfileClient = ({ donorData }) => {
    const [activeTab, setActiveTab] = useState('overview');

    const getImpactBadgeColor = (level) => {
        switch(level) {
          case 'Gold Supporter': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
          case 'Silver Supporter': return 'bg-gray-100 text-gray-800 border-gray-200';
          case 'Bronze Supporter': return 'bg-orange-100 text-orange-800 border-orange-200';
          default: return 'bg-blue-100 text-blue-800 border-blue-200';
        }
      };
    
      const StatCard = ({ icon: Icon, label, value, color = "blue" }) => (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{label}</p>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
            <div className={`p-3 rounded-full bg-${color}-100`}>
              <Icon className={`h-6 w-6 text-${color}-600`} />
            </div>
          </div>
        </div>
      );

      return (
        <div className="min-h-screen bg-gray-50">
          {/* Header */}
          <div className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
                <div className="flex items-center gap-4">
                  <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <Edit className="h-4 w-4" />
                    Edit Profile
                  </button>
                  <form action={signOut}>
                    <button className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors" type="submit">
                      Sign Out
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
    
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Profile Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                  <div className="text-center mb-6">
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 overflow-hidden">
                      {donorData.avatar_url ? (
                        <Image
                          src={donorData.avatar_url}
                          alt={donorData.name}
                          width={80}
                          height={80}
                          className="rounded-full object-cover"
                          quality={100}
                        />
                      ) : (
                        <User className="h-10 w-10 text-blue-600" />
                      )}
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">{donorData.name}</h2>
                    <p className="text-gray-600">Member since {donorData.memberSince}</p>
                    <p className="text-sm text-gray-500 mb-2">Signed up with {donorData.provider}</p>
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border mt-3 ${getImpactBadgeColor(donorData.impactLevel)}`}>
                      <Award className="h-4 w-4" />
                      {donorData.impactLevel}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-gray-600">
                      <Mail className="h-5 w-5" />
                      <span className="text-sm">{donorData.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600">
                      <Phone className="h-5 w-5" />
                      <span className="text-sm">{donorData.phone}</span>
                    </div>
                    <div className="flex items-start gap-3 text-gray-600">
                      <MapPin className="h-5 w-5 mt-0.5" />
                      <span className="text-sm">{donorData.address}</span>
                    </div>
                  </div>
                </div>
    
                {/* Quick Stats */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Impact Summary</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Donated</span>
                      <span className="font-semibold text-green-600">${donorData.totalDonated.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Donations</span>
                      <span className="font-semibold">{donorData.totalDonations}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Last Donation</span>
                      <span className="font-semibold">{donorData.lastDonation}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Average Donation</span>
                      <span className="font-semibold">${Math.round(donorData.totalDonated / donorData.totalDonations)}</span>
                    </div>
                  </div>
                </div>
              </div>
    
              {/* Main Content */}
              <div className="lg:col-span-2">
                {/* Tab Navigation */}
                <div className="bg-white rounded-lg shadow-sm border mb-6">
                  <div className="border-b border-gray-200">
                    <nav className="flex space-x-8 px-6">
                      {[
                        { key: 'overview', label: 'Overview', icon: TrendingUp },
                        { key: 'history', label: 'Donation History', icon: Calendar },
                        { key: 'impact', label: 'My Impact', icon: Heart }
                      ].map(({ key, label, icon: Icon }) => (
                        <button
                          key={key}
                          onClick={() => setActiveTab(key)}
                          className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                            activeTab === key
                              ? 'border-blue-500 text-blue-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                          {label}
                        </button>
                      ))}
                    </nav>
                  </div>
    
                  <div className="p-6">
                    {activeTab === 'overview' && (
                      <div className="space-y-6">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <StatCard icon={DollarSign} label="Total Donated" value={`$${donorData.totalDonated.toLocaleString()}`} color="green" />
                          <StatCard icon={Calendar} label="Total Donations" value={donorData.totalDonations} color="blue" />
                        </div>
    
                        {/* Recent Activity */}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Donations</h3>
                          <div className="space-y-3">
                            {donorData.donationHistory.slice(0, 3).map((donation) => (
                              <div key={donation.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                    <Heart className="h-5 w-5 text-green-600" />
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-900">{donation.cause}</p>
                                    <p className="text-sm text-gray-600">{donation.date}</p>
                                  </div>
                                </div>
                                <span className="font-semibold text-green-600">${donation.amount}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
    
                    {activeTab === 'history' && (
                      <div>
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-lg font-semibold text-gray-900">Donation History</h3>
                          <button className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                            Download Report
                          </button>
                        </div>
                        
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b border-gray-200">
                                <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-900">Cause</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-900">Amount</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-900">Receipt</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {donorData.donationHistory.map((donation) => (
                                <tr key={donation.id} className="hover:bg-gray-50">
                                  <td className="py-4 px-4 text-gray-900">{donation.date}</td>
                                  <td className="py-4 px-4 text-gray-900">{donation.cause}</td>
                                  <td className="py-4 px-4 font-semibold text-green-600">${donation.amount}</td>
                                  <td className="py-4 px-4">
                                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                      {donation.receipt}
                                    </button>
                                  </td>
                                  <td className="py-4 px-4">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                      {donation.status}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
    
                    {activeTab === 'impact' && (
                      <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-gray-900">Your Impact</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                                <Heart className="h-6 w-6 text-white" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-blue-900">Education Impact</h4>
                                <p className="text-sm text-blue-700">Supporting student success</p>
                              </div>
                            </div>
                            <p className="text-2xl font-bold text-blue-900 mb-2">12 Students</p>
                            <p className="text-sm text-blue-700">helped with scholarships and supplies</p>
                          </div>
    
                          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                                <Heart className="h-6 w-6 text-white" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-green-900">Community Impact</h4>
                                <p className="text-sm text-green-700">Building stronger communities</p>
                              </div>
                            </div>
                            <p className="text-2xl font-bold text-green-900 mb-2">8 Programs</p>
                            <p className="text-sm text-green-700">supported across different initiatives</p>
                          </div>
                        </div>
    
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                          <h4 className="font-semibold text-yellow-900 mb-2">Thank You!</h4>
                          <p className="text-yellow-800">Your generous donations have made a real difference in our community. Every contribution helps us continue our mission and expand our reach to help more people in need.</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    };
    
    export default DonorProfileClient;
