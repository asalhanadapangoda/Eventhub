import React, { useState } from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { useAuth } from '../context/AuthContext';
import { visitService } from '../services/api';
import { toast } from '../context/ToastContext';
import {
  Building2,
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  AlertCircle,
  Send,
  MapPin,
  Sparkles,
  Compass,
  FileCheck,
} from 'lucide-react';

export default function IndustryVisitsPage() {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    organizationName: '',
    organizationType: 'University / Faculty',
    contactPerson: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    numberOfParticipants: 25,
    participantAgeGroup: 'Undergraduates (19-24)',
    preferredVisitDate: '',
    preferredTime: '10:00 AM - 01:00 PM',
    visitPurpose: '',
    areasOfInterest: [
      'Bay 05 Maker Space',
      'Robotics & Sensor Labs',
      'Incubation Studios',
      'TRACE Auditorium & History',
    ],
    additionalRequirements: '',
  });

  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const availableAreas = [
    'Bay 05 Maker Space',
    'Robotics & Sensor Labs',
    'Incubation Studios',
    'TRACE Auditorium & History',
    'Venture Kitchens',
    'Hardware Prototyping Benches',
  ];

  const handleTextChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAreaToggle = (area) => {
    const current = formData.areasOfInterest;
    if (current.includes(area)) {
      setFormData({
        ...formData,
        areasOfInterest: current.filter((item) => item !== area),
      });
    } else {
      setFormData({
        ...formData,
        areasOfInterest: [...current, area],
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessData(null);

    try {
      const res = await visitService.createVisitRequest(formData);
      if (res.success) {
        setSuccessData(res);
        toast.success(`Visit application successfully submitted! Ref: ${res.referenceNumber || ''}`);
        setFormData({
          organizationName: '',
          organizationType: 'University / Faculty',
          contactPerson: user?.name || '',
          email: user?.email || '',
          phone: user?.phone || '',
          numberOfParticipants: 25,
          participantAgeGroup: 'Undergraduates (19-24)',
          preferredVisitDate: '',
          preferredTime: '10:00 AM - 01:00 PM',
          visitPurpose: '',
          areasOfInterest: [
            'Bay 05 Maker Space',
            'Robotics & Sensor Labs',
            'Incubation Studios',
            'TRACE Auditorium & History',
          ],
          additionalRequirements: '',
        });
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        'Failed to submit visit request. Please ensure all required fields are filled.';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#faf8ff]">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-[#0B192C] via-[#0e1c2f] to-[#00174b] text-white py-16 relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-96 h-96 bg-[#006398]/20 rounded-full blur-3xl pointer-events-none"></div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-bold uppercase tracking-widest text-[#5bb8fe] mb-4">
                <Building2 className="w-3.5 h-3.5" />
                <span>TRACE EXPERT CITY TOURS &amp; DELEGATIONS</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
                Campus Industry Visits
              </h1>
              <p className="text-sm sm:text-base text-[#bac7e1] mt-3 leading-relaxed">
                Experience Sri Lanka’s premier high-tech business cluster. We welcome university
                faculties, engineering schools, international delegations, and corporate innovation teams
                to explore Bay 05 maker spaces, deep-tech labs, and venture incubation floors.
              </p>
              <div className="mt-4 p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-[#cce5ff] inline-block">
                ℹ️ Industry visit registration is completely independent and does not require enrollment
                in either TRACE academic program.
              </div>
            </div>
          </div>
        </section>

        {/* Content Body */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left: What to Expect & Highlights (5 cols) */}
            <div className="lg:col-span-5 space-y-8">
              <div>
                <span className="text-xs uppercase font-extrabold tracking-wider text-[#006398] block mb-1">
                  Institutional Immersion
                </span>
                <h2 className="text-2xl font-bold text-[#0B192C]">
                  What Your Delegation Will Experience
                </h2>
                <p className="text-xs sm:text-sm text-[#44474c] mt-2 leading-relaxed">
                  Every tour is hosted by TRACE architects and founders, showcasing how a 15-acre
                  historic British warehouse was repurposed into Sri Lanka's leading deep-tech ecosystem.
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-white border border-[#e2e8f0] shadow-xs flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-lg bg-[#eaedff] text-[#006398] flex items-center justify-center shrink-0">
                    <Compass className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#0B192C]">Bay 05 Maker Space Walkthrough</h3>
                    <p className="text-xs text-[#44474c] mt-0.5 leading-relaxed">
                      View live SLA 3D printing, CNC milling, and hardware prototyping benches.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white border border-[#e2e8f0] shadow-xs flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-lg bg-[#eaedff] text-[#006398] flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#0B192C]">Startup Founder Roundtables</h3>
                    <p className="text-xs text-[#44474c] mt-0.5 leading-relaxed">
                      Hear firsthand journeys from deep-tech entrepreneurs solving national challenges.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white border border-[#e2e8f0] shadow-xs flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-lg bg-[#eaedff] text-[#006398] flex items-center justify-center shrink-0">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#0B192C]">Keynote on High-Value Tech</h3>
                    <p className="text-xs text-[#44474c] mt-0.5 leading-relaxed">
                      Engage in structured Q&amp;A sessions in TRACE Auditorium A on engineering careers.
                    </p>
                  </div>
                </div>
              </div>

              {/* Guidelines Box */}
              <div className="p-5 rounded-2xl bg-[#eaedff]/60 border border-[#dae2fd]">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#00476e] mb-2">
                  Visit Guidelines
                </h4>
                <ul className="text-xs text-[#44474c] space-y-1.5">
                  <li>• Applications must be submitted at least 7 days prior to proposed visit date.</li>
                  <li>• Group sizes typically range from 15 to 60 participants.</li>
                  <li>• Bus parking available inside TRACE Expert City grounds.</li>
                  <li>• Initial submission is assigned status: <strong>Pending</strong>.</li>
                </ul>
              </div>
            </div>

            {/* Right: Visit Registration Form (7 cols) */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-2xl border border-[#cbd5e1] p-7 sm:p-9 shadow-md">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-[#0B192C]">
                    Industry Visit Application
                  </h2>
                  <p className="text-xs text-[#44474c] mt-1">
                    Please provide your organization and delegation details for Secretariat review.
                  </p>
                </div>

                {successData && (
                  <div className="mb-6 p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900">
                    <div className="flex items-center gap-2 font-bold text-sm mb-1">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <span>Visit Application Successfully Submitted!</span>
                    </div>
                    <p className="text-xs leading-relaxed mt-1">
                      Your Unique Reference Number is:{' '}
                      <strong className="text-sm text-emerald-950 font-mono">
                        {successData.referenceNumber}
                      </strong>
                    </p>
                    <p className="text-xs text-emerald-800 mt-2">
                      Our Secretariat will review your requested date ({formData.preferredVisitDate}) and
                      respond with schedule confirmation.
                    </p>
                  </div>
                )}

                {errorMsg && (
                  <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Organization Name & Type */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#131b2e] mb-1.5">
                        Organization Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="organizationName"
                        required
                        placeholder="e.g. University of Moratuwa IEEE"
                        value={formData.organizationName}
                        onChange={handleTextChange}
                        className="w-full h-11 px-3.5 rounded-lg border border-[#cbd5e1] focus:border-[#006398] focus:ring-1 focus:ring-[#006398] text-sm outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#131b2e] mb-1.5">
                        Organization Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="organizationType"
                        value={formData.organizationType}
                        onChange={handleTextChange}
                        className="w-full h-11 px-3.5 rounded-lg border border-[#cbd5e1] focus:border-[#006398] focus:ring-1 focus:ring-[#006398] text-sm outline-none bg-white"
                      >
                        <option value="University / Faculty">University / Faculty</option>
                        <option value="School / College">School / College</option>
                        <option value="Corporate Enterprise">Corporate Enterprise</option>
                        <option value="Tech Startup / Incubator">Tech Startup / Incubator</option>
                        <option value="Government / Foreign Delegation">
                          Government / Foreign Delegation
                        </option>
                        <option value="Other">Other Community Group</option>
                      </select>
                    </div>
                  </div>

                  {/* Contact Person, Email, Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#131b2e] mb-1.5">
                        Contact Person <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="contactPerson"
                        required
                        placeholder="Full Name"
                        value={formData.contactPerson}
                        onChange={handleTextChange}
                        className="w-full h-11 px-3.5 rounded-lg border border-[#cbd5e1] focus:border-[#006398] text-sm outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#131b2e] mb-1.5">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        placeholder="contact@domain.lk"
                        value={formData.email}
                        onChange={handleTextChange}
                        className="w-full h-11 px-3.5 rounded-lg border border-[#cbd5e1] focus:border-[#006398] text-sm outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#131b2e] mb-1.5">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        required
                        placeholder="+94 77 123 4567"
                        value={formData.phone}
                        onChange={handleTextChange}
                        className="w-full h-11 px-3.5 rounded-lg border border-[#cbd5e1] focus:border-[#006398] text-sm outline-none"
                      />
                    </div>
                  </div>

                  {/* Participant Count & Age Group */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#131b2e] mb-1.5">
                        Number of Participants <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="numberOfParticipants"
                        min="1"
                        max="200"
                        required
                        value={formData.numberOfParticipants}
                        onChange={handleTextChange}
                        className="w-full h-11 px-3.5 rounded-lg border border-[#cbd5e1] focus:border-[#006398] text-sm outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#131b2e] mb-1.5">
                        Participant Age Group <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="participantAgeGroup"
                        value={formData.participantAgeGroup}
                        onChange={handleTextChange}
                        className="w-full h-11 px-3.5 rounded-lg border border-[#cbd5e1] focus:border-[#006398] text-sm outline-none bg-white"
                      >
                        <option value="School Students (14-18)">School Students (14-18)</option>
                        <option value="Undergraduates (19-24)">Undergraduates (19-24)</option>
                        <option value="Professionals / Researchers (25+)">
                          Professionals / Researchers (25+)
                        </option>
                        <option value="Mixed Demographic">Mixed Demographic</option>
                      </select>
                    </div>
                  </div>

                  {/* Preferred Date & Preferred Time */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#131b2e] mb-1.5">
                        Preferred Visit Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="preferredVisitDate"
                        required
                        value={formData.preferredVisitDate}
                        onChange={handleTextChange}
                        className="w-full h-11 px-3.5 rounded-lg border border-[#cbd5e1] focus:border-[#006398] text-sm outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#131b2e] mb-1.5">
                        Preferred Time Slot <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="preferredTime"
                        value={formData.preferredTime}
                        onChange={handleTextChange}
                        className="w-full h-11 px-3.5 rounded-lg border border-[#cbd5e1] focus:border-[#006398] text-sm outline-none bg-white"
                      >
                        <option value="09:30 AM - 12:30 PM">Morning: 09:30 AM – 12:30 PM</option>
                        <option value="01:30 PM - 04:30 PM">Afternoon: 01:30 PM – 04:30 PM</option>
                        <option value="05:00 PM - 07:30 PM">Evening (Delegations only)</option>
                      </select>
                    </div>
                  </div>

                  {/* Visit Purpose */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#131b2e] mb-1.5">
                      Visit Purpose &amp; Academic Objectives <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="visitPurpose"
                      required
                      rows={3}
                      placeholder="Explain the background of the delegation and what you wish to learn..."
                      value={formData.visitPurpose}
                      onChange={handleTextChange}
                      className="w-full p-3 rounded-lg border border-[#cbd5e1] focus:border-[#006398] text-sm outline-none"
                    ></textarea>
                  </div>

                  {/* Areas of Interest */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#131b2e] mb-2">
                      Areas of Interest (Select all that apply)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {availableAreas.map((area) => {
                        const checked = formData.areasOfInterest.includes(area);
                        return (
                          <button
                            type="button"
                            key={area}
                            onClick={() => handleAreaToggle(area)}
                            className={`p-2.5 rounded-lg text-xs font-medium border text-left transition-all flex items-center justify-between ${
                              checked
                                ? 'bg-[#eaedff] border-[#006398] text-[#006398]'
                                : 'bg-white border-[#e2e8f0] text-[#44474c] hover:bg-[#faf8ff]'
                            }`}
                          >
                            <span>{area}</span>
                            {checked && <CheckCircle2 className="w-4 h-4 text-[#006398]" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Additional Requirements */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#131b2e] mb-1.5">
                      Additional Requirements / Logistics
                    </label>
                    <textarea
                      name="additionalRequirements"
                      rows={2}
                      placeholder="e.g. Bus parking requested, dietary requirements, specific technology focus..."
                      value={formData.additionalRequirements}
                      onChange={handleTextChange}
                      className="w-full p-3 rounded-lg border border-[#cbd5e1] focus:border-[#006398] text-sm outline-none"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 rounded-lg bg-[#006398] hover:bg-[#0284c7] text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-[#006398]/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
                  >
                    {loading ? (
                      <span>Transmitting Application...</span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Submit Industry Visit Request</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

