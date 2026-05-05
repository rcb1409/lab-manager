import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-[#333333] text-white px-4 py-12 pb-24 md:pb-12 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h4 className="font-bold uppercase text-sm mb-4 border-b border-white/20 pb-2">Department of Materials Science and Engineering</h4>
          <p className="text-sm text-gray-400 leading-relaxed">
            North Carolina State University<br />
            2010 Hillsborough Street<br />
            Raleigh, NC 27695
          </p>
        </div>
        <div>
          <h4 className="font-bold uppercase text-sm mb-4 border-b border-white/20 pb-2">Quick Links</h4>
          <ul className="space-y-2">
            <li><Link href="#" className="text-sm text-gray-300 hover:text-white transition-colors">MSE Department Home</Link></li>
            <li><Link href="#" className="text-sm text-gray-300 hover:text-white transition-colors">Safety Guidelines</Link></li>
            <li><Link href="#" className="text-sm text-gray-300 hover:text-white transition-colors">Contact IT Support</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
