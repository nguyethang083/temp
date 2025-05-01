import Head from 'next/head';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import ExamSection from '../components/ExamSection';
import Testimonials from '../components/Testimonials';
import FAQ from '../components/FAQ';
import Footer from '../components/Footer';

export const metadata = {
  title: 'Elearning - Advance your mathematics skills',
  description: 'A student-centric platform for mathematics learning and examination preparation',
};

export default function Home() {
  return (
    <div>
      <Head>
        <title>Elearning - Advance your mathematics skills</title>
        <meta name="description" content="A student-centric platform for mathematics learning and examination preparation" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navbar />
      <main>
        <Hero />
        <ExamSection />
        <Testimonials />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
} 