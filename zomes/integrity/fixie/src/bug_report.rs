use hdi::prelude::*;

#[derive(Clone, PartialEq)]
#[hdk_entry_helper]
pub struct BugReport {
    pub error: String,
    pub stack_trace: Option<String>,
    pub logs: Option<String>,
    pub state_dump: Option<String>,
    pub happ_specific_data: Option<String>,
    pub happ_version: String,
}

pub fn validate_create_bug_report(
    _action: EntryCreationAction,
    _bug_report: BugReport,
) -> ExternResult<ValidateCallbackResult> {
    // TODO: add the appropriate validation rules
    Ok(ValidateCallbackResult::Valid)
}

pub fn validate_update_bug_report(
    _action: Update,
    _bug_report: BugReport,
    _original_action: EntryCreationAction,
    _original_bug_report: BugReport,
) -> ExternResult<ValidateCallbackResult> {
    Ok(ValidateCallbackResult::Invalid(
        "Bug Reports cannot be updated".to_string(),
    ))
}

pub fn validate_delete_bug_report(
    _action: Delete,
    _original_action: EntryCreationAction,
    _original_bug_report: BugReport,
) -> ExternResult<ValidateCallbackResult> {
    Ok(ValidateCallbackResult::Invalid(
        "Bug Reports cannot be deleted".to_string(),
    ))
}
