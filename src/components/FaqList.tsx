import type { Faq } from '../lib/seo-content';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';

export interface FaqListProps {
  /** The section heading, also its accessible name. */
  title: string;
  items: Faq[];
}

/**
 * Questions and answers shown on the page. The same items feed the FAQPage JSON-LD,
 * and Google only uses FAQ structured data that readers can see.
 */
export default function FaqList({ title, items }: FaqListProps) {
  if (items.length === 0) return null;

  return (
    <section className="faq" data-slot="faq" aria-labelledby="faq-title">
      <h2 id="faq-title" className="faq__title">
        {title}
      </h2>
      <Accordion className="faq__list" multiple>
        {items.map((item) => (
          <AccordionItem key={item.question} className="faq__item">
            <AccordionTrigger className="faq__question">{item.question}</AccordionTrigger>
            <AccordionContent>
              <p className="faq__answer">{item.answer}</p>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
