import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { 
  CUSTOMER_PERSONAS, 
  getPersonasByAgeRange, 
  getPersonasByIndustry,
  getRandomPersonas,
  type CustomerPersona 
} from '@shared/customerPersonas';

interface SurveyQuestion {
  id: string;
  question: string;
  type: 'rating' | 'text' | 'multiple_choice' | 'price_point';
  options?: string[];
}

interface SurveyResponse {
  personaId: string;
  questionId: string;
  response: string | number;
  reasoning?: string;
}

interface CustomerFocusGroupProps {
  onSurveyComplete?: (responses: SurveyResponse[]) => void;
  productName?: string;
  productDescription?: string;
}

export function CustomerFocusGroup({ 
  onSurveyComplete, 
  productName = 'Product',
  productDescription = ''
}: CustomerFocusGroupProps) {
  const [selectedPersonas, setSelectedPersonas] = useState<CustomerPersona[]>([]);
  const [filterAge, setFilterAge] = useState<string>('all');
  const [filterIndustry, setFilterIndustry] = useState<string>('all');
  const [filterIncome, setFilterIncome] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('browse');
  const [surveyQuestions, setSurveyQuestions] = useState<SurveyQuestion[]>([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [newQuestionType, setNewQuestionType] = useState<SurveyQuestion['type']>('rating');
  const [simulatedResponses, setSimulatedResponses] = useState<SurveyResponse[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);

  // Get unique industries for filter
  const industries = useMemo(() => {
    const uniqueIndustries = Array.from(new Set(CUSTOMER_PERSONAS.map(p => p.industry)));
    return uniqueIndustries.sort();
  }, []);

  // Filter personas based on criteria
  const filteredPersonas = useMemo(() => {
    let result = [...CUSTOMER_PERSONAS];

    // Age filter
    if (filterAge !== 'all') {
      const [min, max] = filterAge.split('-').map(Number);
      result = result.filter(p => p.age >= min && p.age <= max);
    }

    // Industry filter
    if (filterIndustry !== 'all') {
      result = result.filter(p => p.industry === filterIndustry);
    }

    // Income filter
    if (filterIncome !== 'all') {
      result = result.filter(p => p.incomeLevel === filterIncome);
    }

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(term) ||
        p.occupation.toLowerCase().includes(term) ||
        p.nationality.toLowerCase().includes(term) ||
        p.bio.toLowerCase().includes(term)
      );
    }

    return result;
  }, [filterAge, filterIndustry, filterIncome, searchTerm]);

  const togglePersonaSelection = (persona: CustomerPersona) => {
    setSelectedPersonas(prev => {
      const isSelected = prev.some(p => p.id === persona.id);
      if (isSelected) {
        return prev.filter(p => p.id !== persona.id);
      } else {
        return [...prev, persona];
      }
    });
  };

  const selectRandomPersonas = (count: number) => {
    const random = getRandomPersonas(count);
    setSelectedPersonas(random);
  };

  const addSurveyQuestion = () => {
    if (!newQuestion.trim()) return;
    
    const question: SurveyQuestion = {
      id: `q_${Date.now()}`,
      question: newQuestion,
      type: newQuestionType,
    };
    
    setSurveyQuestions(prev => [...prev, question]);
    setNewQuestion('');
  };

  const removeQuestion = (id: string) => {
    setSurveyQuestions(prev => prev.filter(q => q.id !== id));
  };

  // Simulate AI responses from selected personas
  const simulateSurvey = async () => {
    if (selectedPersonas.length === 0 || surveyQuestions.length === 0) return;
    
    setIsSimulating(true);
    const responses: SurveyResponse[] = [];

    // Simulate responses for each persona and question
    for (const persona of selectedPersonas) {
      for (const question of surveyQuestions) {
        // Generate response based on persona characteristics
        let response: string | number;
        let reasoning: string;

        if (question.type === 'rating') {
          // Generate rating based on persona characteristics
          const baseScore = persona.techComfort * 1.5 + 
            (persona.riskTolerance === 'aggressive' ? 2 : persona.riskTolerance === 'moderate' ? 1 : 0);
          response = Math.min(10, Math.max(1, Math.round(baseScore + (Math.random() * 3 - 1.5))));
          reasoning = `Based on ${persona.name}'s ${persona.decisionStyle} decision style and ${persona.riskTolerance} risk tolerance.`;
        } else if (question.type === 'price_point') {
          // Generate price sensitivity based on income and buying motivation
          const incomeMultiplier = {
            'low': 0.5,
            'medium': 1,
            'high': 1.5,
            'very_high': 2
          }[persona.incomeLevel];
          response = persona.buyingMotivation === 'price' ? 'Low' : 
                    persona.buyingMotivation === 'status' ? 'Premium' : 'Mid-range';
          reasoning = `${persona.name} has ${persona.incomeLevel} income and prioritizes ${persona.buyingMotivation}.`;
        } else {
          response = `Response from ${persona.name} based on their background in ${persona.industry}.`;
          reasoning = `${persona.name}'s pain points include: ${persona.painPoints.join(', ')}.`;
        }

        responses.push({
          personaId: persona.id,
          questionId: question.id,
          response,
          reasoning
        });
      }
    }

    setSimulatedResponses(responses);
    setIsSimulating(false);
    onSurveyComplete?.(responses);
  };

  // Calculate aggregate statistics
  const aggregateStats = useMemo(() => {
    if (simulatedResponses.length === 0) return null;

    const ratingResponses = simulatedResponses.filter(r => typeof r.response === 'number');
    const avgRating = ratingResponses.length > 0 
      ? ratingResponses.reduce((sum, r) => sum + (r.response as number), 0) / ratingResponses.length
      : 0;

    const priceResponses = simulatedResponses.filter(r => 
      typeof r.response === 'string' && ['Low', 'Mid-range', 'Premium'].includes(r.response)
    );
    const priceCounts = {
      'Low': priceResponses.filter(r => r.response === 'Low').length,
      'Mid-range': priceResponses.filter(r => r.response === 'Mid-range').length,
      'Premium': priceResponses.filter(r => r.response === 'Premium').length
    };

    return { avgRating, priceCounts, totalResponses: simulatedResponses.length };
  }, [simulatedResponses]);

  const getTechComfortLabel = (level: number) => {
    const labels = ['Very Low', 'Low', 'Medium', 'High', 'Very High'];
    return labels[level - 1] || 'Unknown';
  };

  const getIncomeColor = (level: string) => {
    const colors = {
      'low': 'bg-gray-500',
      'medium': 'bg-blue-500',
      'high': 'bg-green-500',
      'very_high': 'bg-purple-500'
    };
    return colors[level as keyof typeof colors] || 'bg-gray-500';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Customer Focus Group</CardTitle>
          <CardDescription>
            Select customer personas to validate {productName}. 
            Currently {CUSTOMER_PERSONAS.length} personas available, {selectedPersonas.length} selected.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="browse">Browse Personas</TabsTrigger>
              <TabsTrigger value="selected">Selected ({selectedPersonas.length})</TabsTrigger>
              <TabsTrigger value="survey">Survey Builder</TabsTrigger>
              <TabsTrigger value="results">Results</TabsTrigger>
            </TabsList>

            <TabsContent value="browse" className="space-y-4">
              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 bg-muted/50 rounded-lg">
                <Input
                  placeholder="Search personas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Select value={filterAge} onValueChange={setFilterAge}>
                  <SelectTrigger>
                    <SelectValue placeholder="Age Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Ages</SelectItem>
                    <SelectItem value="18-25">18-25</SelectItem>
                    <SelectItem value="26-35">26-35</SelectItem>
                    <SelectItem value="36-45">36-45</SelectItem>
                    <SelectItem value="46-55">46-55</SelectItem>
                    <SelectItem value="56-65">56-65</SelectItem>
                    <SelectItem value="66-100">66+</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterIndustry} onValueChange={setFilterIndustry}>
                  <SelectTrigger>
                    <SelectValue placeholder="Industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Industries</SelectItem>
                    {industries.map(ind => (
                      <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterIncome} onValueChange={setFilterIncome}>
                  <SelectTrigger>
                    <SelectValue placeholder="Income Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Income Levels</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="very_high">Very High</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => selectRandomPersonas(10)}>
                    Random 10
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => selectRandomPersonas(25)}>
                    Random 25
                  </Button>
                </div>
              </div>

              {/* Persona Grid */}
              <div className="text-sm text-muted-foreground mb-2">
                Showing {filteredPersonas.length} of {CUSTOMER_PERSONAS.length} personas
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto">
                {filteredPersonas.map(persona => {
                  const isSelected = selectedPersonas.some(p => p.id === persona.id);
                  return (
                    <Card 
                      key={persona.id}
                      className={`cursor-pointer transition-all ${isSelected ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-muted/50'}`}
                      onClick={() => togglePersonaSelection(persona)}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold">{persona.name}</h4>
                            <p className="text-sm text-muted-foreground">{persona.occupation}</p>
                          </div>
                          <Badge variant={isSelected ? 'default' : 'outline'}>
                            {isSelected ? 'Selected' : 'Select'}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-1 mb-2">
                          <Badge variant="secondary" className="text-xs">{persona.age}yo</Badge>
                          <Badge variant="secondary" className="text-xs">{persona.nationality}</Badge>
                          <Badge variant="secondary" className="text-xs">{persona.industry}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">{persona.bio}</p>
                        <div className="flex gap-2 mt-2">
                          <Badge className={`text-xs ${getIncomeColor(persona.incomeLevel)}`}>
                            {persona.incomeLevel.replace('_', ' ')}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            Tech: {getTechComfortLabel(persona.techComfort)}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="selected" className="space-y-4">
              {selectedPersonas.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No personas selected. Browse and select personas to build your focus group.
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold">Selected Focus Group ({selectedPersonas.length} personas)</h3>
                    <Button variant="outline" size="sm" onClick={() => setSelectedPersonas([])}>
                      Clear All
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedPersonas.map(persona => (
                      <Card key={persona.id}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold">{persona.name}</h4>
                              <p className="text-sm text-muted-foreground">{persona.occupation}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {persona.age}yo | {persona.nationality} | {persona.location}
                              </p>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => togglePersonaSelection(persona)}
                            >
                              Remove
                            </Button>
                          </div>
                          <div className="mt-3 space-y-2">
                            <div>
                              <span className="text-xs font-medium">Pain Points:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {persona.painPoints.map((pain, i) => (
                                  <Badge key={i} variant="outline" className="text-xs">{pain}</Badge>
                                ))}
                              </div>
                            </div>
                            <div>
                              <span className="text-xs font-medium">Goals:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {persona.goals.map((goal, i) => (
                                  <Badge key={i} variant="secondary" className="text-xs">{goal}</Badge>
                                ))}
                              </div>
                            </div>
                            <div className="flex gap-2 text-xs">
                              <span>Decision Style: <strong>{persona.decisionStyle}</strong></span>
                              <span>Risk: <strong>{persona.riskTolerance}</strong></span>
                              <span>Motivation: <strong>{persona.buyingMotivation}</strong></span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="survey" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Add Survey Question</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-4">
                    <Input
                      placeholder="Enter your question..."
                      value={newQuestion}
                      onChange={(e) => setNewQuestion(e.target.value)}
                      className="flex-1"
                    />
                    <Select value={newQuestionType} onValueChange={(v) => setNewQuestionType(v as SurveyQuestion['type'])}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rating">Rating (1-10)</SelectItem>
                        <SelectItem value="text">Open Text</SelectItem>
                        <SelectItem value="price_point">Price Point</SelectItem>
                        <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={addSurveyQuestion}>Add</Button>
                  </div>
                </CardContent>
              </Card>

              {surveyQuestions.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Survey Questions ({surveyQuestions.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {surveyQuestions.map((q, index) => (
                        <div key={q.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div>
                            <span className="font-medium">Q{index + 1}:</span> {q.question}
                            <Badge variant="outline" className="ml-2">{q.type}</Badge>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => removeQuestion(q.id)}>
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex justify-end">
                <Button 
                  onClick={simulateSurvey}
                  disabled={selectedPersonas.length === 0 || surveyQuestions.length === 0 || isSimulating}
                >
                  {isSimulating ? 'Simulating...' : `Run Survey (${selectedPersonas.length} personas)`}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="results" className="space-y-4">
              {simulatedResponses.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No survey results yet. Build a survey and run it with selected personas.
                </div>
              ) : (
                <>
                  {aggregateStats && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardContent className="p-4">
                          <div className="text-sm text-muted-foreground">Average Rating</div>
                          <div className="text-3xl font-bold">{aggregateStats.avgRating.toFixed(1)}/10</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="text-sm text-muted-foreground">Price Sensitivity</div>
                          <div className="flex gap-2 mt-2">
                            <Badge variant="outline">Low: {aggregateStats.priceCounts['Low']}</Badge>
                            <Badge variant="secondary">Mid: {aggregateStats.priceCounts['Mid-range']}</Badge>
                            <Badge>Premium: {aggregateStats.priceCounts['Premium']}</Badge>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="text-sm text-muted-foreground">Total Responses</div>
                          <div className="text-3xl font-bold">{aggregateStats.totalResponses}</div>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Individual Responses</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4 max-h-[400px] overflow-y-auto">
                        {surveyQuestions.map(question => (
                          <div key={question.id} className="border-b pb-4">
                            <h4 className="font-medium mb-2">{question.question}</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {simulatedResponses
                                .filter(r => r.questionId === question.id)
                                .map(response => {
                                  const persona = selectedPersonas.find(p => p.id === response.personaId);
                                  return (
                                    <div key={`${response.personaId}-${response.questionId}`} className="p-2 bg-muted/30 rounded text-sm">
                                      <div className="font-medium">{persona?.name}</div>
                                      <div className="text-primary">
                                        {typeof response.response === 'number' 
                                          ? `${response.response}/10`
                                          : response.response}
                                      </div>
                                      <div className="text-xs text-muted-foreground">{response.reasoning}</div>
                                    </div>
                                  );
                                })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

export default CustomerFocusGroup;
