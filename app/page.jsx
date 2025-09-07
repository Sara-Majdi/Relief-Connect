import Image from "next/image";
import styles from "./page.module.css";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { AlertTriangle, ArrowRight, CheckCircle, Clock, Heart, Shield } from "lucide-react"
import { Badge } from "@/components/ui/badge";

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="flex items-center justify-center w-full min-h-screen py-20 md:py-32 bg-gradient-to-b from-blue-900 to-blue-300 text-white">
        <div className="container p-6 grid lg:grid-cols-2 gap-2 items-center justify-center">
          <div className="space-y-6">
            <h1 className="text-5xl md:text-6xl font-extrabold leading-tight tracking-tight">
              Connecting Hearts for Malaysian Disaster Relief
            </h1>
            <p className="max-w-xl text-lg text-blue-100">
              ReliefConnect bridges verified NGOs with donors to streamline
              disaster relief efforts across Malaysia.
            </p>
            <div className="flex gap-4">
              <Button className="bg-black border-gray-500" size="lg" asChild>
                <Link href="/donate">Donate Now</Link>
              </Button>
              <Button
              variant="outline"
              size="lg"
              className="text-white border-gray-500 hover:bg-black"
              asChild
              >
                <Link href="/donate">Register as NGO</Link>
              </Button>
            </div>
          </div>
          <Image
            src="https://images.unsplash.com/photo-1506467493604-25d7861a6703?w=1600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bmF0dXJhbCUyMGRpc2FzdGVyJTIwZnJlZXxlbnwwfHwwfHx8MA%3D%3D"
            width={600}
            height={600}
            alt="Disaster relief volunteers"
            className="rounded-2xl shadow-xl object-cover"
            priority
          />
        </div>
      </section>

      {/* Active Campaigns Section */}
      <section className="w-full py-12 md:py-24 bg-white flex items-center justify-center">
        <div className="container items-center justify-center px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Active Relief Campaigns</h2>
              <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Support these verified campaigns to help communities affected by disasters in Malaysia.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
            {/* Campaign Card 1 */}
            <Card>
              <CardHeader className="p-0">
                <div className="relative h-48 w-full">
                  <Image
                    src="/placeholder.svg?height=200&width=400"
                    fill
                    alt="Flood relief campaign"
                    className="object-cover rounded-t-lg"
                  />
                  <Badge className="absolute top-2 right-2 bg-blue-600" variant="secondary">
                    <Clock className="mr-1 h-3 w-3" /> Urgent
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    <CheckCircle className="mr-1 h-3 w-3" /> Verified NGO
                  </Badge>
                </div>
                <CardTitle className="text-xl mb-2">Pahang Flood Relief</CardTitle>
                <CardDescription className="line-clamp-2 mb-4">
                  Supporting communities affected by severe flooding in Pahang state with emergency supplies and
                  shelter.
                </CardDescription>
                <div className="space-y-2">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: "70%" }}></div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">RM 70,000 raised</span>
                    <span className="text-gray-500">of RM 100,000</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t p-6 pt-4">
                <Button variant="outline" size="sm">
                  Learn More
                </Button>
                <Button size="sm">Donate</Button>
              </CardFooter>
            </Card>

            {/* Campaign Card 2 */}
            <Card>
              <CardHeader className="p-0">
                <div className="relative h-48 w-full">
                  <Image
                    src="/placeholder.svg?height=200&width=400"
                    fill
                    alt="Landslide relief campaign"
                    className="object-cover rounded-t-lg"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    <CheckCircle className="mr-1 h-3 w-3" /> Verified NGO
                  </Badge>
                </div>
                <CardTitle className="text-xl mb-2">Cameron Highlands Landslide Recovery</CardTitle>
                <CardDescription className="line-clamp-2 mb-4">
                  Providing aid to families displaced by recent landslides in the Cameron Highlands region.
                </CardDescription>
                <div className="space-y-2">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: "45%" }}></div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">RM 45,000 raised</span>
                    <span className="text-gray-500">of RM 100,000</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t p-6 pt-4">
                <Button variant="outline" size="sm">
                  Learn More
                </Button>
                <Button size="sm">Donate</Button>
              </CardFooter>
            </Card>

            {/* Campaign Card 3 */}
            <Card>
              <CardHeader className="p-0">
                <div className="relative h-48 w-full">
                  <Image
                    src="/placeholder.svg?height=200&width=400"
                    fill
                    alt="Drought relief campaign"
                    className="object-cover rounded-t-lg"
                  />
                  <Badge className="absolute top-2 right-2 bg-amber-600" variant="secondary">
                    <AlertTriangle className="mr-1 h-3 w-3" /> Critical
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    <CheckCircle className="mr-1 h-3 w-3" /> Verified NGO
                  </Badge>
                </div>
                <CardTitle className="text-xl mb-2">Kelantan Drought Response</CardTitle>
                <CardDescription className="line-clamp-2 mb-4">
                  Delivering clean water and essential supplies to communities affected by severe drought in Kelantan.
                </CardDescription>
                <div className="space-y-2">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: "25%" }}></div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">RM 25,000 raised</span>
                    <span className="text-gray-500">of RM 100,000</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t p-6 pt-4">
                <Button variant="outline" size="sm">
                  Learn More
                </Button>
                <Button size="sm">Donate</Button>
              </CardFooter>
            </Card>
          </div>
          <div className="flex justify-center mt-8">
            <Button variant="outline" asChild>
              <Link href="/campaigns">
                View All Campaigns <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>


      {/* Explanation Section */}
      <section className="w-full py-12 md:py-24 bg-gray-50 flex items-center justify-center">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">How ReliefConnect Works</h2>
              <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Our platform connects verified NGOs with donors to ensure efficient disaster relief in Malaysia.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3 mt-12">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">NGO Verification</h3>
                <p className="text-gray-500">
                  We verify all NGOs on our platform to ensure your donations reach legitimate organizations.
                </p>
              </div>
            </div>
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                <Heart className="h-8 w-8 text-blue-600" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Transparent Donations</h3>
                <p className="text-gray-500">
                  Track your donations and see the real-time impact of your contribution on affected communities.
                </p>
              </div>
            </div>
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                <CheckCircle className="h-8 w-8 text-blue-600" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Secure Payments</h3>
                <p className="text-gray-500">
                  Our secure payment gateway ensures your donations are processed safely and reach the intended
                  campaigns.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* CTA Section */}
      <section className="w-full py-12 md:py-24 bg-blue-600 text-white flex items-center justify-center">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Join the Relief Effort</h2>
                <p className="max-w-[600px] text-blue-100 md:text-xl">
                  Whether you're an NGO working on disaster relief or a donor looking to help, ReliefConnect makes it
                  easy to make a difference.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button variant="secondary" size="lg" asChild>
                  <Link href="/donate">Donate Now</Link>
                </Button>
                <Button
                  variant="outline"
                  className="bg-transparent text-white border-white hover:bg-blue-700"
                  size="lg"
                  asChild
                >
                  <Link href="/ngo/register">Register as NGO</Link>
                </Button>
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-blue-700 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-2">For Donors</h3>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle className="mr-2 h-5 w-5 text-blue-300 mt-0.5" />
                    <span>Browse campaigns by disaster type, location, or urgency</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="mr-2 h-5 w-5 text-blue-300 mt-0.5" />
                    <span>Make secure monetary donations to verified NGOs</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="mr-2 h-5 w-5 text-blue-300 mt-0.5" />
                    <span>Track donation impact via real-time updates</span>
                  </li>
                </ul>
              </div>
              <div className="bg-blue-700 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-2">For NGOs</h3>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle className="mr-2 h-5 w-5 text-blue-300 mt-0.5" />
                    <span>Create and manage disaster relief campaigns</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="mr-2 h-5 w-5 text-blue-300 mt-0.5" />
                    <span>Receive secure donations and provide updates</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="mr-2 h-5 w-5 text-blue-300 mt-0.5" />
                    <span>Build trust with donors through verification</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
