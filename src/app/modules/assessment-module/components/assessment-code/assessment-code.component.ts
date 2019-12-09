import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {CompilerService} from '../../services/compiler.service';
import { AssessmentServiceService} from '../../services/assessments.service';

@Component({
  selector: 'app-assessment-code',
  templateUrl: './assessment-code.component.html',
  styleUrls: ['./assessment-code.component.css']
})
export class AssessmentCodeComponent implements OnInit {
  constructor(
    private aRouter: ActivatedRoute,
    private compilerService: CompilerService,
    private assessmentService: AssessmentServiceService,
    private router: Router) { }

    @ViewChild('openModal', {static: true}) openModal: ElementRef;
    @ViewChild('landingModal', {static: true}) landingModal: ElementRef;
    @ViewChild('submissionModal', {static: true}) submissionModal: ElementRef;

  languages = [];
  selectedLanguage = 'csharp';
  currentTime = '00:00:00';
  editorOptions = {theme: 'vs-dark', language: this.selectedLanguage};
  code: string;
  output: string[] = [];
  question: any = {};
  NumberOfTestCasesPassed = 0;
  TotalTestCases = 0;
  isLoading = false;

  ngOnInit() {
    this.landingModal.nativeElement.click();
    this.compilerService.getAllLanguages().subscribe((data) => {
      this.languages = data;
    });
  }

  getQuestionDetails(id){
    this.isLoading = true;
    this.assessmentService.getAssessmentDetailsByID(id).subscribe((data) => {
      this.question = data[0];
      this.startTimer(this.question.TimeInMinutes * 60);
      this.TotalTestCases = this.question.TestValues.length;
      this.isLoading = false;
    });
  }

  changeLanguage(){
    this.editorOptions = {theme: 'vs-dark', language: this.selectedLanguage};
  }

  startTimer(counter){
      const counterInterval: any = setInterval(() => {
      this.currentTime = this.convertSecToClock(counter);
      if (counter === -1) {
        this.submitCode();
        clearInterval(counterInterval);
        this.currentTime = this.convertSecToClock(0);
      }
      counter--;
    }, 1000);
  }

  async runTestCases() {
    this.NumberOfTestCasesPassed = 0;
    this.question.TestValues.forEach(element => {
      this.runTestCase(element);
    });
  }

 runTestCase(element) {
      this.isLoading = true;
      this.compilerService.glotCompiler(this.selectedLanguage,
      {
      stdin: element.Inputs,
      files: [
          {
            name: 'main.cs',
            content: this.code
           }
        ]
    }).subscribe((data) => {
      this.printOutput(data, element);
      this.isLoading = false;
    });
  }

  // async runTestCase(element) {
  //   switch(this.selectedLanguage) {
  //     case 'cpp': {
  //       (async (element) => {
  //         const data = await this.compilerService.ccompiler(this.code, element.Inputs).toPromise();
  //         this.printOutput(data, element);
  //       })(element);
  //       break;
  //     }
  //     case 'csharp':{
  //       (async (element) => {
  //         const data = await this.compilerService.csharpcompiler(this.code, element.Inputs).toPromise();
  //         this.printOutput(data, element);
  //       })(element);
  //       break;
  //     }
  //     case 'java':{
  //       (async (element) => {
  //         const data = await this.compilerService.jcompiler(this.code, element.Inputs).toPromise();
  //         this.printOutput(data, element);
  //       })(element);
  //       break;
  //     }
  //     case 'python':{
  //       (async (element) => {
  //         const data = await this.compilerService.pcompiler(this.code, element.Inputs).toPromise();
  //         this.printOutput(data, element);
  //       })(element);
  //     }
  //   }
  // }




  printOutput(output, element) {
    if (output.error !== '') {
      this.output.unshift(output.error);
    }
    if (output.stdout) {
      if (element.OutPut.trim() === output.stdout.trim()) {
        this.output.unshift(`Input - ${element.Inputs}, Output - ${output.stdout}, Testcase passed`);
        this.NumberOfTestCasesPassed++;
      } else {
        this.output.unshift(`Testcase failed`);
      }
    }
  }

  submitCode() {
    this.isLoading = true;
    this.assessmentService.submitAssessment({
      NumberOfTestCasesPassed: this.NumberOfTestCasesPassed,
      NumberOfTestCasesGiven: this.TotalTestCases,
      AssesmentID: this.question.AssesmentID,
      AssesmentKey: '',
      UserUniqueID: sessionStorage.getItem('username')
    }).subscribe((data) => {
      this.isLoading = false;
      this.openModal.nativeElement.click();
    });
  }

  submitCodeOnClick() {
    this.isLoading = true;
    this.assessmentService.submitAssessment({
      NumberOfTestCasesPassed: this.NumberOfTestCasesPassed,
      NumberOfTestCasesGiven: this.TotalTestCases,
      AssesmentID: this.question.AssesmentID,
      AssesmentKey: '',
      UserUniqueID: sessionStorage.getItem('username')
    }).subscribe((data) => {
      this.isLoading = false;
      this.submissionModal.nativeElement.click();
    });
  }


  closeAssessment() {
    this.router.navigate(['/assessment']);
  }

  closeLandingModal() {
    const id = this.aRouter.snapshot.paramMap.get('id');
    this.landingModal.nativeElement.click();
    this.getQuestionDetails(id);
  }

  convertSecToClock(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    totalSeconds %= 3600;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${hours < 10 ? '0' : ''}${hours}:${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }
}
