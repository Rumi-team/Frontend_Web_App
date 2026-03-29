"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faqs = [
  {
    question: "Is it private?",
    answer:
      "Completely. Your sessions are confidential and never shared with third parties. Enterprise-grade security on Google Cloud.",
  },
  {
    question: "Is it free?",
    answer:
      "Yes, during beta. No credit card required. Sign up takes 30 seconds.",
  },
  {
    question: "What happens in my first session?",
    answer:
      "You'll have a private voice conversation with Rumi about whatever is on your mind. Rumi listens, asks questions that surface patterns you might not see, and measures the depth of your breakthrough in real time. After the session, you'll get personalized assignments to keep your momentum going.",
  },
]

export function FAQ() {
  return (
    <section className="py-20 px-4 md:px-8 max-w-2xl mx-auto">
      <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
        Common questions
      </h2>
      <Accordion
        type="single"
        collapsible
        defaultValue="item-0"
        className="w-full"
      >
        {faqs.map((faq, i) => (
          <AccordionItem
            key={i}
            value={`item-${i}`}
            className="border-white/10"
          >
            <AccordionTrigger className="text-left text-base font-semibold text-gray-200 hover:text-yellow-400 hover:no-underline">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="text-gray-400 text-base leading-relaxed">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  )
}
