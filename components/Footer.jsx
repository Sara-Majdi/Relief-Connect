import Link from "next/link"
import { Facebook, Instagram, Twitter } from "lucide-react"

export function Footer() {
    return (
        <footer className="bg-gray-100 border-t">
            <div className="container px-4 md:px-6 py-8 md:py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="space-y-4">
                        <Link href="/" className="flex items-center space-x-2">
                            <span className="font-bold text-xl">
                                ReliefConnect
                            </span>
                        </Link>
                        <p className="text-sm text-gray-500">
                            Connecting verified NGOs with donors to 
                            streamline disaster relief efforts in 
                            Malaysia.
                        </p>
                        <div className="flex space-x-4">
                            <Link href="#" className="text-gray-500 hover:text-gray-900">
                                <Facebook className="h-5 w-5"/>
                                <span className="sr-only">Facebook</span>
                            </Link>
                            <Link href="#" className="text-gray-500 hover:text-gray-900">
                                <Twitter className="h-5 w-5" />
                                <span className="sr-only">Twitter</span>
                            </Link>
                            <Link href="#" className="text-gray-500 hover:text-gray-900">
                                <Instagram className="h-5 w-5" />
                                <span className="sr-only">Instagram</span>
                            </Link>
                        </div>
                    </div>
                </div>

            </div>

        </footer>
    )
}