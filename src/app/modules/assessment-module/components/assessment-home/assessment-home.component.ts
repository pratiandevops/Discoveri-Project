import { Component, OnInit } from '@angular/core';
import { AssessmentServiceService } from '../../services/assessments.service';
import { Router } from '@angular/router';
import { IAssessment } from 'src/app/models/IAssessment';
import { IUser } from 'src/app/models/IUser';
import { AuthenticationService } from 'src/app/shared-modules/services/authentication.service';

@Component({
  selector: 'app-assessment-home',
  templateUrl: './assessment-home.component.html',
  styleUrls: ['./assessment-home.component.css']
})
export class AssessmentHomeComponent implements OnInit {
  user: IUser;
  assessments: any;
  constructor(
    private assessmentServiceService: AssessmentServiceService,
    private authentication: AuthenticationService,
    private router: Router) { }

  ngOnInit() {
    this.assessmentServiceService.getAssessmentData().subscribe(data => {
      this.assessments = data;
      console.log("Assessments", this.assessments);
    });
  }

  getAssessment(assessment: IAssessment) {
    if (assessment.AssesmentType == "MCQ") {
      this.router.navigate(['/mcq', assessment.AssesmentID])
    }
    else {
      this.router.navigate(['/code', assessment.AssesmentID])
    }
  }

}
