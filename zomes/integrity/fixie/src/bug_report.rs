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

pub fn validate_create_link_untriaged_bug_reports(
    _action: CreateLink,
    _base_address: AnyLinkableHash,
    target_address: AnyLinkableHash,
    _tag: LinkTag,
) -> ExternResult<ValidateCallbackResult> {
    let action_hash =
        target_address
            .into_action_hash()
            .ok_or(wasm_error!(WasmErrorInner::Guest(
                "No action hash associated with link".to_string()
            )))?;
    let record = must_get_valid_record(action_hash)?;
    let _bug_report: crate::BugReport = record
        .entry()
        .to_app_option()
        .map_err(|e| wasm_error!(e))?
        .ok_or(wasm_error!(WasmErrorInner::Guest(
            "Linked action must reference an entry".to_string()
        )))?;
    // TODO: add the appropriate validation rules
    Ok(ValidateCallbackResult::Valid)
}

pub fn validate_delete_link_untriaged_bug_reports(
    _action: DeleteLink,
    _original_action: CreateLink,
    _base: AnyLinkableHash,
    _target: AnyLinkableHash,
    _tag: LinkTag,
) -> ExternResult<ValidateCallbackResult> {
    // TODO: add the appropriate validation rules
    Ok(ValidateCallbackResult::Valid)
}
