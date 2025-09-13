'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { StepIndicator, type Step } from '@/components/forms/StepIndicator';
import { SmartPhoneInput } from '@/components/forms/SmartPhoneInput';
import { AutoCompleteInput, AREA_OPTIONS, OCCUPATION_OPTIONS } from '@/components/forms/AutoCompleteInput';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useFormValidation, validationSchemas, type ValidationRule } from '@/hooks/useFormValidation';
import { 
  UserPlus, 
  Phone, 
  MapPin, 
  Users, 
  Briefcase, 
  TrendingUp, 
  Banknote, 
  Building2, 
  Eye, 
  FileText,
  Save,
  ArrowLeft,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

interface FormData {
  name: string;
  phone: string;
  gender: string;
  ageRange: string;
  residenceArea: string;
  familyRelation: string;
  occupation: string;
  investHabit: string;
  expectedBudget: string;
  ownAssets: string[];
  lastVisitMH: string;
  notes: string;
  source: string;
}

const STEPS: Step[] = [
  {
    id: 1,
    title: '기본 정보',
    description: '성명, 연락처, 성별, 나이대',
    isCompleted: false,
    isActive: true
  },
  {
    id: 2,
    title: '개인 정보',
    description: '거주지역, 가족관계, 직업',
    isCompleted: false,
    isActive: false
  },
  {
    id: 3,
    title: '투자 정보',
    description: '투자성향, 예산, 보유자산',
    isCompleted: false,
    isActive: false
  },
  {
    id: 4,
    title: '추가 정보',
    description: '방문이력, 특이사항, 유입경로',
    isCompleted: false,
    isActive: false
  }
];

const VALIDATION_RULES: ValidationRule[] = [
  { field: 'name', schema: validationSchemas.name },
  { field: 'phone', schema: validationSchemas.phone },
  { field: 'gender', schema: validationSchemas.gender },
  { field: 'ageRange', schema: validationSchemas.ageRange },
  { field: 'residenceArea', schema: validationSchemas.residenceArea },
  { field: 'familyRelation', schema: validationSchemas.familyRelation },
  { field: 'occupation', schema: validationSchemas.occupation },
  { field: 'investHabit', schema: validationSchemas.investHabit },
  { field: 'expectedBudget', schema: validationSchemas.expectedBudget },
  { field: 'source', schema: validationSchemas.source },
  { field: 'notes', schema: validationSchemas.notes }
];

const REQUIRED_FIELDS = ['name', 'phone', 'gender', 'ageRange'];

const STEP_FIELDS = {
  1: ['name', 'phone', 'gender', 'ageRange'],
  2: ['residenceArea', 'familyRelation', 'occupation'],
  3: ['investHabit', 'expectedBudget', 'ownAssets'],
  4: ['lastVisitMH', 'notes', 'source']
};

export default function NewCustomerPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [steps, setSteps] = useState<Step[]>(STEPS);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    phone: '',
    gender: '',
    ageRange: '',
    residenceArea: '',
    familyRelation: '',
    occupation: '',
    investHabit: '',
    expectedBudget: '',
    ownAssets: [],
    lastVisitMH: '',
    notes: '',
    source: ''
  });

  const validation = useFormValidation({
    rules: VALIDATION_RULES,
    data: formData,
    requiredFields: REQUIRED_FIELDS,
    mode: 'onChange'
  });

  const autoSave = useAutoSave({
    key: 'customer-form',
    data: formData,
    delay: 3000,
    enabled: true,
    onRestore: (data) => setFormData(data),
    showToast: true
  });

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCheckboxChange = (field: string, value: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked 
        ? [...(prev[field as keyof FormData] as string[]), value]
        : (prev[field as keyof FormData] as string[]).filter(item => item !== value)
    }));
  };

  const updateStepCompletion = () => {
    const updatedSteps = steps.map(step => {
      const stepFields = STEP_FIELDS[step.id as keyof typeof STEP_FIELDS];
      const isCompleted = validation.isStepComplete(stepFields);
      return {
        ...step,
        isCompleted: step.id < currentStep || isCompleted,
        isActive: step.id === currentStep
      };
    });
    setSteps(updatedSteps);
  };

  const canProceedToNextStep = () => {
    const currentStepFields = STEP_FIELDS[currentStep as keyof typeof STEP_FIELDS];
    return validation.isStepComplete(currentStepFields);
  };

  const handleNextStep = () => {
    if (canProceedToNextStep() && currentStep < 4) {
      setCurrentStep(currentStep + 1);
      updateStepCompletion();
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      updateStepCompletion();
    }
  };

  const handleStepClick = (stepId: number) => {
    if (stepId <= currentStep || steps[stepId - 1].isCompleted) {
      setCurrentStep(stepId);
      updateStepCompletion();
    }
  };

  const handleSubmit = async () => {
    if (!validation.isValid) {
      toast({
        title: '입력 오류',
        description: '필수 항목을 모두 입력해주세요.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const normalizedPhone = formData.phone.replace(/[^\d]/g, '');
      
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          phone: normalizedPhone,
          expectedBudget: formData.expectedBudget ? parseInt(formData.expectedBudget) : null,
          ownAssets: formData.ownAssets.join(', ')
        }),
      });

      if (response.ok) {
        autoSave.clearStorage();
        toast({
          title: '고객 등록 성공',
          description: '새로운 고객이 성공적으로 등록되었습니다.',
        });
        router.push('/dashboard/customers');
      } else {
        const error = await response.json();
        throw new Error(error.message || '고객 등록에 실패했습니다.');
      }
    } catch (error) {
      toast({
        title: '등록 실패',
        description: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            성명 *
          </Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="고객명을 입력하세요"
            className={`bg-white/50 ${validation.getFieldStatus('name').hasError ? 'border-red-500' : ''}`}
          />
          {validation.getFieldStatus('name').error && (
            <p className="text-sm text-red-500">{validation.getFieldStatus('name').error?.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            연락처 *
          </Label>
          <SmartPhoneInput
            value={formData.phone}
            onChange={(value) => handleInputChange('phone', value)}
            className={validation.getFieldStatus('phone').hasError ? 'border-red-500' : ''}
          />
          {validation.getFieldStatus('phone').error && (
            <p className="text-sm text-red-500">{validation.getFieldStatus('phone').error?.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="flex items-center gap-2">성별 *</Label>
          <RadioGroup 
            value={formData.gender} 
            onValueChange={(value) => handleInputChange('gender', value)}
            className="flex gap-6"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="남성" id="male" />
              <Label htmlFor="male">남성</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="여성" id="female" />
              <Label htmlFor="female">여성</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">나이대 *</Label>
          <Select value={formData.ageRange} onValueChange={(value) => handleInputChange('ageRange', value)}>
            <SelectTrigger className="bg-white/50">
              <SelectValue placeholder="나이대를 선택하세요" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="20대">20대</SelectItem>
              <SelectItem value="30대">30대</SelectItem>
              <SelectItem value="40대">40대</SelectItem>
              <SelectItem value="50대">50대</SelectItem>
              <SelectItem value="60대 이상">60대 이상</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            거주지역
          </Label>
          <AutoCompleteInput
            options={AREA_OPTIONS}
            value={formData.residenceArea}
            onChange={(value) => handleInputChange('residenceArea', value)}
            placeholder="거주지역을 입력하세요"
            className="bg-white/50"
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            가족관계
          </Label>
          <Select value={formData.familyRelation} onValueChange={(value) => handleInputChange('familyRelation', value)}>
            <SelectTrigger className="bg-white/50">
              <SelectValue placeholder="가족관계를 선택하세요" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="본인">본인</SelectItem>
              <SelectItem value="배우자">배우자</SelectItem>
              <SelectItem value="부모">부모</SelectItem>
              <SelectItem value="자녀">자녀</SelectItem>
              <SelectItem value="기타">기타</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Briefcase className="h-4 w-4" />
          직업
        </Label>
        <AutoCompleteInput
          options={OCCUPATION_OPTIONS}
          value={formData.occupation}
          onChange={(value) => handleInputChange('occupation', value)}
          placeholder="직업을 입력하세요"
          className="bg-white/50"
        />
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            투자성향
          </Label>
          <Select value={formData.investHabit} onValueChange={(value) => handleInputChange('investHabit', value)}>
            <SelectTrigger className="bg-white/50">
              <SelectValue placeholder="투자성향을 선택하세요" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="시세차익">시세차익</SelectItem>
              <SelectItem value="월수익">월수익</SelectItem>
              <SelectItem value="실거주">실거주</SelectItem>
              <SelectItem value="기타">기타</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Banknote className="h-4 w-4" />
            예상 투자 가능 금액 (계약금 기준)
          </Label>
          <Input
            type="number"
            value={formData.expectedBudget}
            onChange={(e) => handleInputChange('expectedBudget', e.target.value)}
            placeholder="만원 단위로 입력"
            className="bg-white/50"
          />
        </div>
      </div>

      <div className="space-y-3">
        <Label className="flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          보유한 부동산 (다중 선택 가능)
        </Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {['아파트', '오피스텔', '빌라/연립', '단독주택', '상가', '토지', '기타'].map((asset) => (
            <div key={asset} className="flex items-center space-x-2">
              <Checkbox 
                id={asset}
                checked={formData.ownAssets.includes(asset)}
                onCheckedChange={(checked) => handleCheckboxChange('ownAssets', asset, !!checked)}
              />
              <Label htmlFor={asset} className="text-sm">{asset}</Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Eye className="h-4 w-4" />
          최근 방문 모델하우스
        </Label>
        <Input
          value={formData.lastVisitMH}
          onChange={(e) => handleInputChange('lastVisitMH', e.target.value)}
          placeholder="최근 방문한 모델하우스를 입력하세요"
          className="bg-white/50"
        />
      </div>

      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          특이사항
        </Label>
        <Textarea
          value={formData.notes}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          placeholder="특이사항이나 메모를 입력하세요"
          className="bg-white/50 min-h-[100px]"
        />
      </div>

      <div className="space-y-2">
        <Label>유입경로</Label>
        <Select value={formData.source} onValueChange={(value) => handleInputChange('source', value)}>
          <SelectTrigger className="bg-white/50">
            <SelectValue placeholder="유입경로를 선택하세요" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="광고">광고</SelectItem>
            <SelectItem value="TM">TM</SelectItem>
            <SelectItem value="필드">필드</SelectItem>
            <SelectItem value="소개">소개</SelectItem>
            <SelectItem value="기타">기타</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      default: return renderStep1();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.back()}
              className="h-10 w-10"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                <UserPlus className="h-8 w-8 text-blue-600" />
                온시아 고객관리카드
              </h1>
              <p className="text-slate-600 mt-1">스마트한 4단계 입력 시스템</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-sm text-slate-600">
              진행률: {validation.progress}%
            </div>
            {autoSave.status.status === 'saved' && (
              <div className="flex items-center gap-2 text-green-600 text-sm">
                <CheckCircle className="h-4 w-4" />
                자동저장됨
              </div>
            )}
          </div>
        </div>

        <StepIndicator 
          steps={steps} 
          currentStep={currentStep} 
          onStepClick={handleStepClick}
        />

        <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
          <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                {currentStep === 1 && <Phone className="h-5 w-5 text-blue-600" />}
                {currentStep === 2 && <MapPin className="h-5 w-5 text-blue-600" />}
                {currentStep === 3 && <TrendingUp className="h-5 w-5 text-blue-600" />}
                {currentStep === 4 && <FileText className="h-5 w-5 text-blue-600" />}
                {steps[currentStep - 1].title}
              </CardTitle>
              <p className="text-slate-600">{steps[currentStep - 1].description}</p>
            </CardHeader>
            
            <CardContent>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {renderCurrentStep()}
                </motion.div>
              </AnimatePresence>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevStep}
              disabled={currentStep === 1}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              이전
            </Button>

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isSubmitting}
              >
                취소
              </Button>

              {currentStep < 4 ? (
                <Button
                  type="button"
                  onClick={handleNextStep}
                  disabled={!canProceedToNextStep()}
                  className="flex items-center gap-2"
                >
                  다음
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting || !validation.isValid}
                  className="min-w-32 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      저장 중...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      저장하기
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}