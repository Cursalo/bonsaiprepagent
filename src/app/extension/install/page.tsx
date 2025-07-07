'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Download,
  Chrome,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Copy,
  Folder,
  Settings
} from 'lucide-react';
import Link from 'next/link';

export default function ExtensionInstallPage() {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-xl border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-bonsai-gradient rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">🌱</span>
              </div>
              <span className="text-white font-bold text-xl">Bonsai</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10" asChild>
                <Link href="/dashboard">← Back to Dashboard</Link>
              </Button>
            </div>
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 mx-auto mb-6 bg-blue-500/20 rounded-xl flex items-center justify-center">
            <Chrome className="h-10 w-10 text-blue-400" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Install Bonsai Browser Extension
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Get real-time AI assistance while studying on Khan Academy, College Board, and other SAT prep platforms.
          </p>
        </div>

        {/* Installation Methods */}
        <div className="space-y-8">
          {/* Method 1: Chrome Web Store (Coming Soon) */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white flex items-center">
                    <Chrome className="mr-2 h-5 w-5 text-blue-400" />
                    Chrome Web Store (Recommended)
                  </CardTitle>
                  <CardDescription className="text-white/70 mt-2">
                    One-click installation from the official Chrome Web Store
                  </CardDescription>
                </div>
                <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                  Coming Soon
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2 text-white/60">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">We're preparing for Chrome Web Store submission. Use the simple manual installation below.</span>
              </div>
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <div className="text-blue-300 text-sm font-medium mb-2">📋 To publish on Chrome Web Store, we need:</div>
                <div className="text-blue-200/80 text-sm space-y-1">
                  <div>• $5 developer account registration</div>
                  <div>• Store listing with screenshots</div>
                  <div>• 1-3 day review process</div>
                  <div>• Privacy policy and compliance review</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Method 2: Manual Installation */}
          <Card className="bg-white/5 border-white/10 ring-2 ring-bonsai-500">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white flex items-center">
                    <Folder className="mr-2 h-5 w-5 text-bonsai-400" />
                    Manual Installation (Developer Mode)
                  </CardTitle>
                  <CardDescription className="text-white/70 mt-2">
                    Install directly from source files - available now!
                  </CardDescription>
                </div>
                <Badge className="bg-bonsai-gradient">Available Now</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Step 1 */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-bonsai-gradient rounded-full flex items-center justify-center text-white font-bold text-sm">1</div>
                  <h4 className="text-white font-semibold">Download Extension (Easy!)</h4>
                </div>
                <div className="ml-11 space-y-4">
                  <p className="text-white/70">
                    📦 <strong>Simplest option:</strong> Download the ready-to-install ZIP file
                  </p>
                  
                  <div className="bg-gradient-to-r from-bonsai-500/10 to-blue-500/10 rounded-lg p-4 border border-bonsai-500/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-white font-medium">📥 Direct Download</div>
                        <div className="text-white/70 text-sm">Pre-built extension ready to install</div>
                      </div>
                      <Button
                        className="bg-bonsai-gradient hover:opacity-90"
                        asChild
                      >
                        <Link href="https://github.com/Cursalo/bonsaiprepagent/archive/main.zip" target="_blank" rel="noopener noreferrer">
                          <Download className="mr-2 h-4 w-4" />
                          Download ZIP
                        </Link>
                      </Button>
                    </div>
                  </div>

                  <div className="bg-black/20 rounded-lg p-3 border border-white/10">
                    <details className="text-white/60">
                      <summary className="cursor-pointer text-white/80 font-medium">🔧 For Developers: Clone with Git</summary>
                      <div className="mt-2 space-y-2">
                        <div className="bg-black/30 rounded p-2 font-mono text-xs text-green-400">
                          git clone https://github.com/Cursalo/bonsaiprepagent.git
                        </div>
                        <p className="text-xs">Use this if you want to modify the extension code</p>
                      </div>
                    </details>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-bonsai-gradient rounded-full flex items-center justify-center text-white font-bold text-sm">2</div>
                  <h4 className="text-white font-semibold">Extract & Open Chrome Extensions</h4>
                </div>
                <div className="ml-11 space-y-3">
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                    <div className="text-blue-300 text-sm font-medium mb-2">📂 First, extract the ZIP file:</div>
                    <div className="text-blue-200/80 text-sm">
                      Right-click the downloaded ZIP → "Extract All" → Choose a folder you'll remember
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-white/80 font-medium text-sm">🔧 Then open Chrome Extensions:</div>
                    <ol className="text-white/70 text-sm space-y-1 list-decimal list-inside ml-4">
                      <li>Open Chrome and type <code className="bg-black/30 px-2 py-1 rounded text-xs">chrome://extensions/</code> in the address bar</li>
                      <li>Toggle on <strong className="text-white">"Developer mode"</strong> in the top-right corner</li>
                      <li>You'll see new buttons appear: "Load unpacked", "Pack extension", etc.</li>
                    </ol>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-bonsai-gradient rounded-full flex items-center justify-center text-white font-bold text-sm">3</div>
                  <h4 className="text-white font-semibold">Install the Extension</h4>
                </div>
                <div className="ml-11 space-y-3">
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                    <div className="text-green-300 text-sm font-medium mb-2">🎯 Almost there! Just click and select:</div>
                    <ol className="text-green-200/80 text-sm space-y-1 list-decimal list-inside">
                      <li>Click <strong className="text-white">"Load unpacked"</strong> button</li>
                      <li>Browse to your extracted folder</li>
                      <li>Select the <code className="bg-black/30 px-2 py-1 rounded text-xs">browser-extension</code> folder</li>
                      <li>Click <strong className="text-white">"Select Folder"</strong></li>
                    </ol>
                  </div>
                  
                  <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
                    <div className="text-purple-300 text-sm font-medium mb-1">✨ Success!</div>
                    <div className="text-purple-200/80 text-sm">
                      The Bonsai extension should now appear in your extensions list with a green toggle switch!
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-bonsai-gradient rounded-full flex items-center justify-center text-white font-bold text-sm">4</div>
                  <h4 className="text-white font-semibold">Pin the Extension</h4>
                </div>
                <div className="ml-11 space-y-3">
                  <ol className="text-white/70 text-sm space-y-2 list-decimal list-inside">
                    <li>Click the extensions puzzle piece icon in Chrome's toolbar</li>
                    <li>Find "Bonsai SAT Prep Assistant" and click the pin icon</li>
                    <li>The Bonsai 🌱 icon should now appear in your toolbar!</li>
                  </ol>
                </div>
              </div>

              <div className="bg-bonsai-500/10 border border-bonsai-500/30 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-bonsai-400 mt-0.5" />
                  <div>
                    <h5 className="text-white font-medium">Installation Complete!</h5>
                    <p className="text-white/70 text-sm mt-1">
                      Visit Khan Academy or College Board to see Bonsai in action. Look for the floating 🌱 assistant!
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Test the Extension */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Test Your Installation</CardTitle>
              <CardDescription className="text-white/70">
                Try these platforms to see Bonsai in action
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <Button 
                  variant="outline" 
                  className="border-white/20 text-white hover:bg-white/10 justify-start"
                  asChild
                >
                  <Link href="https://www.khanacademy.org/sat" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Khan Academy SAT
                  </Link>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="border-white/20 text-white hover:bg-white/10 justify-start"
                  asChild
                >
                  <Link href="https://satsuite.collegeboard.org/digital/digital-practice-preparation" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    College Board Practice
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Troubleshooting */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Troubleshooting</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h5 className="text-white font-medium">Extension doesn't appear after installation</h5>
                  <p className="text-white/70 text-sm">
                    Make sure you selected the <code className="bg-black/30 px-1 rounded">browser-extension</code> folder, not the root project folder.
                  </p>
                </div>
                
                <div>
                  <h5 className="text-white font-medium">Bonsai doesn't show up on websites</h5>
                  <p className="text-white/70 text-sm">
                    Check that the extension has permissions. Go to <code className="bg-black/30 px-1 rounded">chrome://extensions/</code> and ensure permissions are granted.
                  </p>
                </div>
                
                <div>
                  <h5 className="text-white font-medium">Need help?</h5>
                  <p className="text-white/70 text-sm">
                    Contact support or check our <Link href="/help" className="text-blue-400 hover:underline">help documentation</Link>.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Next Steps */}
        <div className="mt-12 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">What's Next?</h3>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-bonsai-gradient hover:opacity-90" asChild>
              <Link href="/dashboard">
                Back to Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10" asChild>
              <Link href="/practice">
                Start Practicing
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}