            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Do Not Disturb</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-900 rounded-xl">
                      <div>
                        <div className="font-medium text-white">Enable Do Not Disturb</div>
                        <div className="text-sm text-foreground/60">Pause all notifications</div>
                      </div>
                      <button className="w-12 h-6 rounded-full transition-colors bg-gray-700">
                        <div className="w-5 h-5 rounded-full bg-white transition-transform translate-x-0.5" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Email Digest</h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Daily Digest', description: 'Receive a summary email every morning', selected: true },
                      { label: 'Weekly Digest', description: 'Get a weekly roundup on Mondays', selected: false },
                      { label: 'Urgent Only', description: 'Only receive emails for critical alerts', selected: false },
                      { label: 'No Emails', description: 'Disable all email notifications', selected: false },
                    ].map((option, index) => (
                      <label key={index} className="flex items-center gap-3 p-3 bg-gray-900 rounded-lg cursor-pointer hover:bg-gray-850 transition-colors">
                        <input
                          type="radio"
                          name="emailDigest"
                          defaultChecked={option.selected}
                          className="w-4 h-4 text-cyan-500 bg-gray-800 border-gray-600 focus:ring-cyan-500"
                        />
                        <div>
                          <div className="font-medium text-white">{option.label}</div>
                          <div className="text-sm text-foreground/60">{option.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-white mb-6">Notification Preferences</h3>
                  <div className="space-y-4">
                    {[
                      { label: 'The Signal Reminder', description: 'Get reminded to check your daily brief each morning', enabled: true },
                      { label: 'Mood Check Prompts', description: 'Receive prompts to log your mood 3x daily', enabled: true },
                      { label: 'Task Deadlines', description: 'Get notified before task deadlines', enabled: true },
                      { label: 'AI Insights', description: 'Receive insights from your Chief of Staff', enabled: false },
                      { label: 'Weekly Summary', description: 'Get a weekly productivity summary', enabled: true },
                      { label: 'Security Alerts', description: 'Get notified of security events in The Vault', enabled: true },
                      { label: 'Integration Status', description: 'Alerts when connected services have issues', enabled: true },
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-900 rounded-xl">
                        <div>
                          <div className="font-medium text-white">{item.label}</div>
                          <div className="text-sm text-foreground/60">{item.description}</div>
                        </div>
                        <button
                          className={`w-12 h-6 rounded-full transition-colors ${
                            item.enabled ? 'bg-cyan-500' : 'bg-gray-700'
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded-full bg-white transition-transform ${
                              item.enabled ? 'translate-x-6' : 'translate-x-0.5'
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'privacy' && (
              <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-6">Privacy Settings</h3>
                <div className="space-y-6">
                  <div className="p-4 bg-gray-900 rounded-xl">
                    <h4 className="font-medium text-white mb-2">Data Collection</h4>
                    <p className="text-sm text-foreground/70 mb-4">
                      Control what data your Chief of Staff can access and learn from.
                    </p>
                    <div className="space-y-3">
                      {[
                        { label: 'Learn from conversations', enabled: true },
                        { label: 'Analyze calendar patterns', enabled: true },
                        { label: 'Track mood over time', enabled: true },
                        { label: 'Share anonymized insights', enabled: false },
                      ].map((item, index) => (
                        <label key={index} className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            defaultChecked={item.enabled}
                            className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-cyan-500 focus:ring-cyan-500"
                          />
                          <span className="text-foreground/80">{item.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 bg-gray-900 rounded-xl">
                    <h4 className="font-medium text-white mb-2">Data Retention</h4>
                    <p className="text-sm text-foreground/70 mb-4">
                      Choose how long to keep your data.
                    </p>
                    <select className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500">
                      <option>Keep forever</option>
                      <option>1 year</option>
                      <option>6 months</option>
                      <option>3 months</option>
                    </select>
                  </div>

                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                    <h4 className="font-medium text-red-400 mb-2">Danger Zone</h4>
                    <p className="text-sm text-foreground/70 mb-4">
                      Permanently delete your account and all associated data.
                    </p>
                    <button className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors">
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            )}
