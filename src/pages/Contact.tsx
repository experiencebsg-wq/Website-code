import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, Instagram, Facebook, Twitter } from 'lucide-react';
import { Layout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { submitContactForm, ContactFormData } from '@/services/api';
import { toast } from 'sonner';

const COMPANY_EMAIL = 'experienceBSG@gmail.com';
const WEBSITE = 'experienceBSG.com';

const contactInfo = [
  {
    icon: MapPin,
    title: 'Visit Us',
    details: ['Lagos, Nigeria', 'By Appointment Only'],
  },
  {
    icon: Phone,
    title: 'Call Us',
    details: ['+234 800 000 0000', '+234 900 000 0000'],
  },
  {
    icon: Mail,
    title: 'Email Us',
    details: [COMPANY_EMAIL],
  },
  {
    icon: Clock,
    title: 'Business Hours',
    details: ['Mon - Fri: 9am - 6pm', 'Sat: 10am - 4pm'],
  },
];

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

const socialLinks = [
  { name: 'Instagram', icon: Instagram, url: 'https://www.instagram.com/experiencebsg?igsh=aXo4YXU1cTBqN3k4' },
  { name: 'Facebook', icon: Facebook, url: 'https://facebook.com' },
  { name: 'Twitter', icon: Twitter, url: 'https://twitter.com' },
];

export default function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email?.trim()) {
      toast.error('Please enter your email address.');
      return;
    }
    if (!isValidEmail(formData.email)) {
      toast.error('Please enter a valid email address.');
      return;
    }
    setIsSubmitting(true);

    try {
      const response = await submitContactForm(formData);
      if (response.success) {
        toast.success(response.message);
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: '',
        });
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to send message.';
      toast.error(msg.includes('valid email') ? msg : 'Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="pt-32 pb-16 bg-navy-gradient">
        <div className="container-luxury text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-sm uppercase tracking-luxury text-gold mb-4">Get In Touch</p>
            <h1 className="text-display-lg text-foreground mb-4">Contact Us</h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Have questions or need assistance? We'd love to hear from you.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="section-padding">
        <div className="container-luxury">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-display-sm text-foreground mb-8">Send Us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name" className="text-muted-foreground">
                      Your Name *
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="mt-2 h-12 bg-card border-border"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-muted-foreground">
                      Email Address *
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      placeholder="you@example.com"
                      className="mt-2 h-12 bg-card border-border"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="phone" className="text-muted-foreground">
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="mt-2 h-12 bg-card border-border"
                    />
                  </div>
                  <div>
                    <Label htmlFor="subject" className="text-muted-foreground">
                      Subject *
                    </Label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      className="mt-2 w-full h-12 px-4 bg-card border border-border rounded-sm text-foreground focus:outline-none focus:border-gold transition-colors"
                    >
                      <option value="">Select a subject</option>
                      <option value="general">General Inquiry</option>
                      <option value="order">Order Support</option>
                      <option value="product">Product Question</option>
                      <option value="wholesale">Wholesale Inquiry</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="message" className="text-muted-foreground">
                    Your Message *
                  </Label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="mt-2 w-full px-4 py-3 bg-card border border-border rounded-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold transition-colors resize-none"
                    placeholder="How can we help you?"
                  />
                </div>

                <Button type="submit" variant="gold" size="lg" disabled={isSubmitting}>
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h2 className="text-display-sm text-foreground mb-8">Contact Information</h2>
              
              <div className="space-y-8 mb-12">
                {contactInfo.map((item) => (
                  <div key={item.title} className="flex gap-4">
                    <div className="w-12 h-12 shrink-0 rounded-full border border-gold/30 flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-gold" />
                    </div>
                    <div>
                      <h3 className="font-display text-lg text-foreground mb-1">{item.title}</h3>
                      {item.details.map((detail, i) => (
                        <p key={i} className="text-muted-foreground">
                          {detail}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Social Links */}
              <div>
                <h3 className="font-display text-lg text-foreground mb-4">Follow Us</h3>
                <div className="flex gap-4">
                  {socialLinks.map((social) => (
                    <a
                      key={social.name}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-gold hover:border-gold transition-colors duration-300"
                      aria-label={social.name}
                    >
                      <social.icon className="w-5 h-5" />
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
