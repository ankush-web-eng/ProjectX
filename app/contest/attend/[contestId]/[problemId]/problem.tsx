// 'use client';

// import { useState, useCallback, useEffect, useRef } from 'react';
// import { useParams } from 'next/navigation';
// import axios from 'axios';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
// import Editor from '@monaco-editor/react';
// import { Clock, Award, FileText, Send, Play, ListChecks } from 'lucide-react';
// import { Problem, Submission } from '@/types/User';

// export default function Page() {
//     const [problem, setProblem] = useState<Problem | null>(null);
//     const [submissions, setSubmissions] = useState<Submission[]>([]);
//     const [code, setCode] = useState('');
//     const [language, setLanguage] = useState('cpp');
//     const [isPolling, setIsPolling] = useState(false);
//     const pollTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
//     const lastFetchRef = useRef<number>(0);
//     const FETCH_COOLDOWN = 30000; // 30 seconds

//     const params = useParams();
//     const { contestId, problemId } = params;

//     const fetchProblem = useCallback(async () => {
//         const now = Date.now();
//         if (now - lastFetchRef.current < FETCH_COOLDOWN) {
//             return; // Don't fetch if within cooldown
//         }
        
//         try {
//             const res = await axios.get(
//                 `${process.env.NEXT_PUBLIC_API_URL}/live/get/${contestId}/${problemId}`,
//                 { 
//                     withCredentials: true,
//                     headers: {
//                         'Cache-Control': 'max-age=300' // Cache for 5 minutes
//                     }
//                 }
//             );
//             setProblem(res.data.problem);
//             lastFetchRef.current = now;
//         } catch (error) {
//             console.error(error);
//         }
//     }, [contestId, problemId]);

//     const fetchSubmissions = useCallback(async () => {
//         if (!isPolling) return;
        
//         try {
//             const res = await axios.get(
//                 `${process.env.NEXT_PUBLIC_API_URL}/live/submissions/${problemId}`,
//                 { withCredentials: true }
//             );
//             setSubmissions(res.data.submissions);
            
//             // If there are pending submissions, continue polling
//             const hasPendingSubmission = res.data.submissions.some(
//                 (sub: Submission) => sub.Status === 'Processing'
//             );
            
//             if (hasPendingSubmission) {
//                 pollTimeoutRef.current = setTimeout(() => fetchSubmissions(), 5000);
//             } else {
//                 setIsPolling(false);
//             }
//         } catch (error) {
//             console.error(error);
//             setIsPolling(false);
//         }
//     }, [problemId, isPolling]);

//     useEffect(() => {
//         fetchProblem();
//         return () => {
//             if (pollTimeoutRef.current) {
//                 clearTimeout(pollTimeoutRef.current);
//             }
//         };
//     }, [fetchProblem]);

//     useEffect(() => {
//         if (isPolling) {
//             fetchSubmissions();
//         }
//     }, [isPolling, fetchSubmissions]);

//     const handleRunCode = async () => {
//         // Implement run code functionality
//     };

//     const handleSubmitCode = async () => {
//         try {
//             await axios.post(
//                 `${process.env.NEXT_PUBLIC_API_URL}/live/submit`,
//                 {
//                     contestId,
//                     problemId,
//                     code,
//                     language
//                 },
//                 { withCredentials: true }
//             );
//             setIsPolling(true); // Start polling for submission status
//             fetchSubmissions();
//         } catch (error) {
//             console.error(error);
//         }
//     };

//     // Debounced code change handler
//     const debouncedSetCode = useCallback(
//         debounce((value: string) => {
//             setCode(value);
//         }, 1000),
//         []
//     );

//     const getStatusColor = (status: string) => {
//         const statusColors: Record<string, string> = {
//             'Accepted': 'bg-green-500',
//             'Wrong Answer': 'bg-red-500',
//             'Time Limit Exceeded': 'bg-yellow-500',
//             'Runtime Error': 'bg-orange-500',
//             'Compilation Error': 'bg-purple-500'
//         };
//         return statusColors[status] || 'bg-gray-500';
//     };

//     return (
//         <div className="min-h-screen flex py-28">
//             <div className="w-1/2 p-4 overflow-y-auto">
//                 <Tabs defaultValue="problem" className="w-full">
//                     <TabsList className="grid w-full grid-cols-2">
//                         <TabsTrigger value="problem">
//                             <FileText className="w-4 h-4 mr-2" />
//                             Problem
//                         </TabsTrigger>
//                         <TabsTrigger value="submissions">
//                             <ListChecks className="w-4 h-4 mr-2" />
//                             Submissions
//                         </TabsTrigger>
//                     </TabsList>

//                     <TabsContent value="problem">
//                         {problem ? (
//                             <Card>
//                                 <CardHeader>
//                                     <CardTitle className="flex items-center justify-between">
//                                         <span>{problem.Title}</span>
//                                         <Badge variant="secondary">{problem.Difficulty}</Badge>
//                                     </CardTitle>
//                                     <div className="flex gap-4 text-sm text-gray-500">
//                                         <div className="flex items-center">
//                                             <Clock className="w-4 h-4 mr-1" />
//                                             {problem.TimeLimit}ms
//                                         </div>
//                                         <div className="flex items-center">
//                                             {/* <Memory className="w-4 h-4 mr-1" /> */}
//                                             {problem.MemoryLimit}MB
//                                         </div>
//                                         <div className="flex items-center">
//                                             <Award className="w-4 h-4 mr-1" />
//                                             {problem.Score} points
//                                         </div>
//                                     </div>
//                                 </CardHeader>
//                                 <CardContent>
//                                     <div className="prose max-w-none">
//                                         <div className="mb-6">{problem.Description}</div>

//                                         {problem.SampleInput && (
//                                             <div className="mb-4">
//                                                 <h3 className="text-lg font-semibold mb-2">Sample Input</h3>
//                                                 <pre className="bg-gray-100 p-4 rounded-lg">{problem.SampleInput}</pre>
//                                             </div>
//                                         )}

//                                         {problem.SampleOutput && (
//                                             <div className="mb-4">
//                                                 <h3 className="text-lg font-semibold mb-2">Sample Output</h3>
//                                                 <pre className="bg-gray-100 p-4 rounded-lg">{problem.SampleOutput}</pre>
//                                             </div>
//                                         )}
//                                     </div>
//                                 </CardContent>
//                             </Card>
//                         ) : (
//                             <div className="flex justify-center items-center h-64">
//                                 <p>Loading...</p>
//                             </div>
//                         )}
//                     </TabsContent>

//                     <TabsContent value="submissions">
//                         <Card>
//                             <CardHeader>
//                                 <CardTitle>Your Submissions</CardTitle>
//                             </CardHeader>
//                             <CardContent>
//                                 <div className="space-y-4">
//                                     {submissions.map((submission) => (
//                                         <div
//                                             key={submission.ID}
//                                             className="flex items-center justify-between p-4 border rounded-lg"
//                                         >
//                                             <div className="flex items-center gap-4">
//                                                 <Badge
//                                                     className={getStatusColor(submission.Status)}
//                                                 >
//                                                     {submission.Status}
//                                                 </Badge>
//                                                 <span>{new Date(submission.SubmittedAt).toLocaleString()}</span>
//                                             </div>
//                                             <div className="flex items-center gap-4">
//                                                 <span>{submission.Runtime}ms</span>
//                                                 <span>{submission.Memory}MB</span>
//                                                 <span>{submission.Language}</span>
//                                             </div>
//                                         </div>
//                                     ))}
//                                 </div>
//                             </CardContent>
//                         </Card>
//                     </TabsContent>
//                 </Tabs>
//             </div>

//             <div className="w-1/2 p-4 flex flex-col">
//                 <div className="mb-4 flex items-center gap-2">
//                     <select
//                         className="border rounded p-2"
//                         value={language}
//                         onChange={(e) => setLanguage(e.target.value)}
//                     >
//                         <option value="cpp">C++</option>
//                         <option value="python">Python</option>
//                         <option value="java">Java</option>
//                     </select>
//                     <Button
//                         onClick={handleRunCode}
//                         className="flex items-center gap-2"
//                     >
//                         <Play className="w-4 h-4" />
//                         Run Code
//                     </Button>
//                     <Button
//                         onClick={handleSubmitCode}
//                         variant="default"
//                         className="flex items-center gap-2"
//                     >
//                         <Send className="w-4 h-4" />
//                         Submit
//                     </Button>
//                 </div>
//                 <div className="flex-grow border rounded-lg overflow-hidden">
//                     <Editor
//                         height="100%"
//                         defaultLanguage={language}
//                         value={code}
//                         onChange={(value) => debouncedSetCode(value || '')}
//                         theme="vs-dark"
//                         options={{
//                             minimap: { enabled: false },
//                             fontSize: 14,
//                             lineNumbers: 'on',
//                             automaticLayout: true,
//                         }}
//                     />
//                 </div>
//             </div>
//         </div>
//     );
// }

// // Debounce utility function
// function debounce<T extends (...args: unknown[]) => ReturnType<T>>(
//     func: T,
//     wait: number
// ): (...args: Parameters<T>) => void {
//     let timeout: NodeJS.Timeout;
//     return (...args: Parameters<T>) => {
//         clearTimeout(timeout);
//         timeout = setTimeout(() => func(...args), wait);
//     };
// }