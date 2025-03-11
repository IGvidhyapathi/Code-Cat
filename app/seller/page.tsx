"use client";

import { IconMail, IconBrandGithub, IconCheck, IconAlertCircle } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Sparkles } from "@/components/ui/sparkles";

export default function SellerPage() {
  return (
    <div className="min-h-screen bg-slate-950 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Hero Section */}
        <div className="mx-auto max-w-2xl text-center">
          <Sparkles>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-orange-500 via-yellow-400 to-orange-400">
              Become a Seller
            </h1>
          </Sparkles>
          <p className="mt-6 text-lg leading-8 text-gray-300">
            Join our community of developers and showcase your projects to the world. Follow the guidelines below to get started.
          </p>
        </div>

        {/* Main Content */}
        <div className="mx-auto mt-16 max-w-2xl rounded-3xl ring-1 ring-slate-800/10 backdrop-blur-xl bg-slate-900/50 sm:mt-20 lg:mx-0 lg:flex lg:max-w-none">
          <div className="p-8 sm:p-10 lg:flex-auto">
            <h3 className="text-2xl font-bold tracking-tight text-white">Seller Requirements</h3>
            <p className="mt-6 text-base leading-7 text-gray-300">
              Before becoming a seller, please ensure you meet our quality standards and guidelines. Review the requirements below:
            </p>
            <div className="mt-10 flex items-center gap-x-4">
              <h4 className="flex-none text-sm font-semibold leading-6 text-blue-400">What&apos;s included</h4>
              <div className="h-px flex-auto bg-slate-800"></div>
            </div>
            <ul className="mt-8 grid grid-cols-1 gap-4 text-sm leading-6 text-gray-300 sm:grid-cols-2 sm:gap-6">
              {[
                "High-quality, original projects",
                "Detailed documentation",
                "Regular maintenance and updates",
                "Responsive support for buyers",
                "Clear licensing terms",
                "Demo version availability",
                "Professional presentation",
                "Code quality standards"
              ].map((feature) => (
                <li key={feature} className="flex gap-x-3">
                  <IconCheck className="h-6 w-5 flex-none text-blue-400" />
                  {feature}
                </li>
              ))}
            </ul>

            {/* Important Notes */}
            <div className="mt-10 space-y-4">
              <h4 className="text-xl font-semibold text-white">Important Notes</h4>
              {[
                "All projects must pass our quality review process",
                "Sellers must maintain a response time of under 48 hours",
                "Regular updates and bug fixes are required",
                "Clear documentation and setup instructions are mandatory"
              ].map((note) => (
                <div key={note} className="flex items-start gap-3 text-gray-300">
                  <IconAlertCircle className="h-5 w-5 flex-none text-yellow-400 mt-1" />
                  <p>{note}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Section */}
          <div className="mt-2 p-2 lg:mt-0 lg:w-full lg:max-w-md lg:flex-shrink-0">
            <motion.div 
              className="rounded-2xl bg-slate-800/50 py-10 text-center ring-1 ring-inset ring-slate-700/20 lg:flex lg:flex-col lg:justify-center lg:py-16"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <div className="mx-auto max-w-xs px-8">
                <p className="text-base font-semibold text-gray-300">Ready to become a seller?</p>
                <p className="mt-6 flex items-baseline justify-center gap-x-2">
                  <span className="text-5xl font-bold tracking-tight text-white">Contact Us</span>
                </p>
                <Button
                  className="mt-10 w-full"
                  onClick={() => window.location.href = 'mailto:c.vidhyapathi1555@gmail.com'}
                >
                  <IconMail className="mr-2 h-4 w-4" />
                  Send Email
                </Button>
                <p className="mt-6 text-xs leading-5 text-gray-400">
                  Email us at <span className="text-blue-400">c.vidhyapathi1555@gmail.com</span> with your project details and portfolio
                </p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="mx-auto mt-16 max-w-2xl lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-8 lg:max-w-none lg:grid-cols-3">
            {[
              {
                name: "Review Process",
                description: "Our team will review your application and projects within 3-5 business days.",
              },
              {
                name: "Support",
                description: "Dedicated support to help you get started and succeed as a seller.",
              },
              {
                name: "Benefits",
                description: "Access to a growing community of developers and potential buyers.",
              },
            ].map((feature) => (
              <div key={feature.name} className="flex flex-col bg-slate-900/50 backdrop-blur-xl rounded-2xl p-6">
                <dt className="text-lg font-semibold leading-7 text-white">{feature.name}</dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-300">
                  <p className="flex-auto">{feature.description}</p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
} 