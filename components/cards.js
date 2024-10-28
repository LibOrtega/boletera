"use client"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"

export default function Component() {
  const [activeTab, setActiveTab] = useState("all")

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="flex items-center justify-between p-4 bg-gray-900">
        <div className="flex items-center space-x-4">
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            height="24"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            width="24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
          </svg>
          <span className="text-xl font-bold">Music Fest</span>
        </div>
        <nav className="hidden md:flex space-x-4">
          <Link className="hover:text-gray-300" href="#">
            Lineup
          </Link>
          <Link className="hover:text-gray-300" href="#">
            Experience
          </Link>
          <Link className="hover:text-gray-300" href="#">
            Camping
          </Link>
          <Link className="hover:text-gray-300" href="#">
            Travel
          </Link>
          <Link className="hover:text-gray-300" href="#">
            Guides
          </Link>
        </nav>
        <div className="flex space-x-2">
          <button className="px-4 py-2 text-sm font-medium text-white bg-transparent border border-white rounded-md hover:bg-white hover:text-black transition-colors">
            Log in
          </button>
          <button className="px-4 py-2 text-sm font-medium text-black bg-white rounded-md hover:bg-gray-200 transition-colors">
            Sign up
          </button>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-6">Events</h1>
      
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <EventCard
            image="/placeholder.svg?height=400&width=600"
            title="Electric Daisy Carnival, EDC Las Vegas 2023"
            date="May 19 - May 21, 2023"
            location="Las Vegas Motor Speedway"
          />
          <EventCard
            image="/placeholder.svg?height=400&width=600"
            title="Coachella Valley Music and Arts Festival 2023"
            date="April 14 - April 16, 2023"
            location="Empire Polo Club"
          />
          <EventCard
            image="/placeholder.svg?height=400&width=600"
            title="Tomorrowland 2023"
            date="July 21 - July 23, 2023"
            location="De Schorre Recreation Area"
          />
          <EventCard
            image="/placeholder.svg?height=400&width=600"
            title="Ultra Music Festival Miami"
            date="March 24 - March 26, 2023"
            location="Bayfront Park"
          />
        </div>
      </main>
    </div>
  )
}

function EventCard({ image, title, date, location, organizer }) {
  return (
    <div className="overflow-hidden bg-gray-800 text-white rounded-lg">
      <Image
        alt={title}
        className="object-cover w-full h-48"
        height="200"
        src={image}
        style={{
          aspectRatio: "300/200",
          objectFit: "cover",
        }}
        width="300"
      />
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-2">{title}</h2>
        <p className="text-sm text-gray-400 mb-1">{date}</p>
        <p className="text-sm text-gray-400"><span className="inline-block mr-2">📍</span>{location}</p>
        <p className="text-sm text-base-content opacity-60 mb-4">
                  <span className="inline-block mr-2">🎟️</span>{organizer}
                </p>
      </div>
      <button 
                className="btn w-full mt-auto bg-pink-200 hover:bg-pink-300 text-gray-800 border-none" 
                onClick={() => handleBuyClick(event)}
              >
                Comprar
              </button>
    </div>
  )
}