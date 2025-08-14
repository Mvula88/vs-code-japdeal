'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronDown, ChevronUp } from 'lucide-react';

const faqs = [
  {
    category: 'General',
    questions: [
      {
        question: 'What is JapDEAL?',
        answer: 'JapDEAL is Namibia&apos;s premier online platform for Japanese vehicle imports. We provide access to quality Japanese vehicles through our transparent auction system.',
      },
      {
        question: 'How do I get started?',
        answer: 'Simply create a free account, browse our available vehicles, and start bidding on the cars you&apos;re interested in.',
      },
      {
        question: 'Is JapDEAL legitimate?',
        answer: 'Yes, JapDEAL is a registered company in Namibia. We work with certified Japanese exporters and handle all legal documentation for vehicle imports.',
      },
    ],
  },
  {
    category: 'Bidding',
    questions: [
      {
        question: 'How does the bidding process work?',
        answer: 'Each vehicle has a starting price and bidding increment. You can place bids during the auction period. The highest bidder when the auction ends wins the vehicle.',
      },
      {
        question: 'Is there a bidding fee?',
        answer: 'No, bidding is completely free. You only pay if you win an auction.',
      },
      {
        question: 'Can I cancel my bid?',
        answer: 'Bids are binding and cannot be cancelled once placed. Please bid responsibly.',
      },
    ],
  },
  {
    category: 'Payment',
    questions: [
      {
        question: 'What payment methods do you accept?',
        answer: 'We accept bank transfers, credit/debit cards, and approved financing options.',
      },
      {
        question: 'When do I need to pay?',
        answer: 'Payment is required within 48 hours of winning an auction. An invoice will be sent to your registered email.',
      },
      {
        question: 'Are there additional fees?',
        answer: 'Yes, there are import duties, shipping costs, and a service fee. All fees are clearly outlined before you bid.',
      },
    ],
  },
  {
    category: 'Shipping & Delivery',
    questions: [
      {
        question: 'How long does shipping take?',
        answer: 'Shipping from Japan to Namibia typically takes 4-6 weeks, depending on the shipping schedule and customs clearance.',
      },
      {
        question: 'Do you handle customs clearance?',
        answer: 'Yes, we handle all customs documentation and clearance processes on your behalf.',
      },
      {
        question: 'Can you deliver to my location?',
        answer: 'Vehicles arrive at Walvis Bay port. We can arrange inland transportation to major cities for an additional fee.',
      },
    ],
  },
];

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-4 px-6 text-left hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-medium">{question}</h3>
          {isOpen ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </button>
      {isOpen && (
        <div className="px-6 pb-4">
          <p className="text-muted-foreground">{answer}</p>
        </div>
      )}
    </div>
  );
}

export default function FAQPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-lg text-muted-foreground">
            Find answers to common questions about JapDEAL
          </p>
        </div>

        <div className="space-y-8">
          {faqs.map((category, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle>{category.category}</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {category.questions.map((faq, faqIndex) => (
                  <FAQItem
                    key={faqIndex}
                    question={faq.question}
                    answer={faq.answer}
                  />
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-12 bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle>Still have questions?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Can&apos;t find the answer you&apos;re looking for? Our support team is here to help.
            </p>
            <a href="/contact" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-10 py-2 px-4">
              Contact Support
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}