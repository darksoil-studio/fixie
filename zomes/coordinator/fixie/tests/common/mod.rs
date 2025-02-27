pub async fn sample_bug_report_1(conductor: &SweetConductor, zome: &SweetZome) -> BugReport {
    BugReport {
        error: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.".to_string(),
        stack_trace: Some("Lorem ipsum dolor sit amet, consectetur adipiscing elit.".to_string()),
        logs: Some("Lorem ipsum dolor sit amet, consectetur adipiscing elit.".to_string()),
        state_dump: Some("Lorem ipsum dolor sit amet, consectetur adipiscing elit.".to_string()),
        happ_specific_data: Some(
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit.".to_string(),
        ),
        happ_version: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.".to_string(),
    }
}

pub async fn sample_bug_report_2(conductor: &SweetConductor, zome: &SweetZome) -> BugReport {
    BugReport {
        error: "Lorem ipsum 2".to_string(),
        stack_trace: Some("Lorem ipsum 2".to_string()),
        logs: Some("Lorem ipsum 2".to_string()),
        state_dump: Some("Lorem ipsum 2".to_string()),
        happ_specific_data: Some("Lorem ipsum 2".to_string()),
        happ_version: "Lorem ipsum 2".to_string(),
    }
}

pub async fn create_bug_report(
    conductor: &SweetConductor,
    zome: &SweetZome,
    bug_report: BugReport,
) -> Record {
    let record: Record = conductor.call(zome, "create_bug_report", bug_report).await;
    record
}

pub async fn sample_issue_1(conductor: &SweetConductor, zome: &SweetZome) -> Issue {
    Issue {
        title: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.".to_string(),
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.".to_string(),
        issue_status: IssueStatus::Open,
    }
}

pub async fn sample_issue_2(conductor: &SweetConductor, zome: &SweetZome) -> Issue {
    Issue {
        title: "Lorem ipsum 2".to_string(),
        description: "Lorem ipsum 2".to_string(),
        issue_status: IssueStatus::Fixed,
    }
}

pub async fn create_issue(conductor: &SweetConductor, zome: &SweetZome, issue: Issue) -> Record {
    let record: Record = conductor.call(zome, "create_issue", issue).await;
    record
}
