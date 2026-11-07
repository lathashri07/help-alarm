import React from 'react';

export const LocationTracker = ({ location, locationMessage, alertSending, onTriggerAlert }) => {
  return (
    <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl p-8 hover:border-cyan-500/20 transition-all duration-300">
      <h2 className="text-2xl md:text-3xl font-extrabold text-slate-100 mb-6 flex items-center gap-2">
        <span className="text-3xl">📍</span>
        Location Tracking
      </h2>

      <div className="mb-6">
        <button
          id="test-trigger"
          disabled={alertSending}
          onClick={onTriggerAlert}
          className="w-full bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 text-white font-extrabold py-4 px-6 rounded-xl shadow-lg shadow-rose-600/30 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 flex items-center justify-center gap-2 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-base md:text-lg"
        >
          {alertSending ? '🚨 Sending Emergency Alert...' : '🚨 Trigger Emergency Alert (Test Hook)'}
        </button>
      </div>

      {locationMessage && (
        <div className={`mb-6 p-4 rounded-xl font-semibold text-sm md:text-base border ${
          locationMessage.includes('✅')
            ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/35'
            : locationMessage.includes('⚠️')
            ? 'bg-amber-950/40 text-amber-300 border-amber-500/35'
            : 'bg-cyan-950/40 text-cyan-300 border-cyan-500/35'
        }`}>
          {locationMessage}
        </div>
      )}

      {location && (
        <div className="mb-6 p-5 bg-slate-950/40 border border-white/5 rounded-xl">
          <p className="text-emerald-400 font-bold text-base md:text-lg mb-2 flex items-center gap-1.5">
            <span>📌</span> Current Location (Real-time):
          </p>
          <p className="text-slate-300 text-sm md:text-base font-medium mb-1">
            <strong className="text-slate-400">Latitude:</strong> {location.latitude.toFixed(6)}
          </p>
          <p className="text-slate-300 text-sm md:text-base font-medium mb-3">
            <strong className="text-slate-400">Longitude:</strong> {location.longitude.toFixed(6)}
          </p>
          <p className="text-sm font-bold">
            <a
              href={`https://maps.google.com/?q=${location.latitude},${location.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 hover:underline transition-all duration-300"
            >
              🗺️ View on Google Maps &rarr;
            </a>
          </p>
        </div>
      )}

      <p className="text-center text-slate-400 font-medium text-xs md:text-sm p-4 bg-slate-950/40 rounded-xl border border-white/5">
        ✨ Location is automatically detected when app loads and updated when emergency is triggered
      </p>
    </div>
  );
};

export const AlertStatus = ({ contacts, lastAlert, message }) => {
  return (
    <div className="space-y-6">
      {/* Alert Message Display */}
      {message && (
        <div className={`rounded-xl shadow-lg p-6 md:p-8 border font-semibold text-sm md:text-base whitespace-pre-line leading-relaxed ${
          message.includes('✅')
            ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/35 animate-pulse'
            : message.includes('🚨')
            ? 'bg-rose-950/40 text-rose-300 border-rose-500/35 animate-pulse'
            : 'bg-amber-950/40 text-amber-300 border-amber-500/35'
        }`}>
          {message}
        </div>
      )}

      {/* Emergency Alert Info */}
      <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl p-8 hover:border-rose-500/20 transition-all duration-300">
        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-100 mb-6 flex items-center gap-2">
          <span className="text-3xl md:text-4xl text-rose-500">🆘</span>
          Emergency Alert Status
        </h2>

        <div className="mb-6 p-6 bg-slate-950/40 rounded-xl border border-white/5">
          <p className="text-slate-200 mb-3">
            <span className="font-bold text-base md:text-lg">📞 Emergency Contacts:</span>
          </p>
          {contacts.length > 0 ? (
            <div className="space-y-2.5">
              {contacts.map((contact, index) => (
                <p key={contact.id} className="text-slate-300 flex items-center gap-2 text-sm md:text-base font-medium">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>{index + 1}. {contact.contact_name} &bull; <span className="font-mono text-cyan-400">{contact.phone_number}</span></span>
                </p>
              ))}
            </div>
          ) : (
            <p className="text-rose-400 font-semibold text-sm md:text-base">
              ⚠️ No emergency contacts added. Please add contacts first!
            </p>
          )}
        </div>

        {/* Alert Details if sent */}
        {lastAlert && (
          <div className="mb-6 p-6 bg-emerald-950/20 border border-emerald-500/30 rounded-xl shadow-inner">
            <p className="font-bold text-emerald-400 text-base md:text-lg mb-3">✅ Last Emergency Alert Sent:</p>
            <div className="space-y-1 text-sm md:text-base text-slate-300 font-medium mb-4">
              <p><span className="text-slate-400">Contacts Notified:</span> <span className="text-slate-100 font-bold">{lastAlert.contacts}</span></p>
              <p><span className="text-slate-400">Time:</span> {lastAlert.timestamp.toLocaleTimeString()}</p>
              <p><span className="text-slate-400">Location:</span> {lastAlert.location.latitude.toFixed(4)}, {lastAlert.location.longitude.toFixed(4)}</p>
            </div>
            
            {lastAlert.smsResults && lastAlert.smsResults.length > 0 && (
              <div className="mt-4 p-4 bg-slate-900/60 rounded-xl border border-white/5">
                <p className="font-bold text-emerald-400 mb-2.5 text-sm md:text-base">📱 SMS Status:</p>
                <div className="space-y-1.5">
                  {lastAlert.smsResults.map((result, idx) => (
                    <p key={idx} className={`text-xs md:text-sm font-medium ${result.status === 'sent' || result.status.includes('demo') ? 'text-emerald-300' : 'text-rose-300'}`}>
                      {result.status === 'sent' || result.status.includes('demo') ? '✅' : '❌'} {result.contact} (<span className="font-mono">{result.phone}</span>): {result.status}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {lastAlert.pushResults && lastAlert.pushResults.length > 0 && (
              <div className="mt-4 p-4 bg-slate-900/60 rounded-xl border border-white/5">
                <p className="font-bold text-indigo-400 mb-2.5 text-sm md:text-base">🔔 Push Notification Status:</p>
                <div className="space-y-1.5">
                  {lastAlert.pushResults.map((result, idx) => (
                    <p key={idx} className={`text-xs md:text-sm font-medium ${result.status === 'delivered' ? 'text-indigo-300' : 'text-rose-300'}`}>
                      {result.status === 'delivered' ? '✅' : '❌'} {result.contact} (<span className="font-mono">{result.phone}</span>): {result.status}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="p-5 bg-slate-950/40 border border-white/5 rounded-xl">
          <p className="text-slate-200 font-bold text-sm md:text-base mb-3 flex items-center gap-1.5">
            <span className="text-cyan-400">🪶</span> Emergency Protocol:
          </p>
          <ul className="text-xs md:text-sm text-slate-400 space-y-2.5 font-medium list-disc list-inside">
            <li><strong className="text-slate-300">Voice Trigger</strong> &mdash; Monitoring activates automatically when the keyword <strong className="text-rose-400">"HELP"</strong> is detected.</li>
            <li><strong className="text-slate-300">Geo-Location</strong> &mdash; Gathers real-time GPS coordinates and builds maps redirects.</li>
            <li><strong className="text-slate-300">Instant Alerting</strong> &mdash; Distributes siren sweeps and notifies emergency contacts via SMS.</li>
          </ul>
        </div>

        <p className="text-xs md:text-sm text-rose-300 mt-4 font-semibold text-center p-4 bg-rose-950/20 border border-rose-500/20 rounded-xl">
          ⚡ Automatic Activation &mdash; Speak "HELP" to trigger all emergency systems instantly.
        </p>
      </div>
    </div>
  );
};
