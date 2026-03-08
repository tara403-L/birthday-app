import { useApp } from "../App";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function WaitingPage() {
  const { count } = useApp();

  return (
    <div className="min-h-screen bg-white text-near-black flex flex-col">
      <main className="flex-1 px-4 py-8 max-w-md mx-auto w-full flex flex-col justify-center">
        <p className="text-xl text-near-black mb-4">გაგზავნილია! დაელოდეთ სანამ ლექტორი შედეგებს გამოაჩენს...</p>
        <div className="bg-light-gray rounded-card p-6">
          <p className="text-near-black text-lg">
            <span className="font-bold text-gold text-2xl">{count}</span>
            <span className="ml-2">სტუდენტმა გაგზავნა</span>
          </p>
        </div>
      </main>
      <footer className="bg-charcoal text-white py-4 px-4 text-center text-sm">
        ალბათობა და სტატისტიკა
      </footer>
    </div>
  );
}
