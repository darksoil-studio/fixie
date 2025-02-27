use fixie_integrity::*;
use hdk::prelude::*;

#[hdk_extern]
pub fn create_issue(issue: Issue) -> ExternResult<Record> {
    let issue_hash = create_entry(&EntryTypes::Issue(issue.clone()))?;
    let record = get(issue_hash.clone(), GetOptions::default())?.ok_or(wasm_error!(
        WasmErrorInner::Guest("Could not find the newly created Issue".to_string())
    ))?;
    let path = Path::from("open_issues");
    create_link(
        path.path_entry_hash()?,
        issue_hash.clone(),
        LinkTypes::OpenIssues,
        (),
    )?;
    Ok(record)
}

#[hdk_extern]
pub fn get_latest_issue(original_issue_hash: ActionHash) -> ExternResult<Option<Record>> {
    let links = get_links(
        GetLinksInputBuilder::try_new(original_issue_hash.clone(), LinkTypes::IssueUpdates)?
            .build(),
    )?;
    let latest_link = links
        .into_iter()
        .max_by(|link_a, link_b| link_a.timestamp.cmp(&link_b.timestamp));
    let latest_issue_hash = match latest_link {
        Some(link) => {
            link.target
                .clone()
                .into_action_hash()
                .ok_or(wasm_error!(WasmErrorInner::Guest(
                    "No action hash associated with link".to_string()
                )))?
        }
        None => original_issue_hash.clone(),
    };
    get(latest_issue_hash, GetOptions::default())
}

#[hdk_extern]
pub fn get_original_issue(original_issue_hash: ActionHash) -> ExternResult<Option<Record>> {
    let Some(details) = get_details(original_issue_hash, GetOptions::default())? else {
        return Ok(None);
    };
    match details {
        Details::Record(details) => Ok(Some(details.record)),
        _ => Err(wasm_error!(WasmErrorInner::Guest(
            "Malformed get details response".to_string()
        ))),
    }
}

#[hdk_extern]
pub fn get_all_revisions_for_issue(original_issue_hash: ActionHash) -> ExternResult<Vec<Record>> {
    let Some(original_record) = get_original_issue(original_issue_hash.clone())? else {
        return Ok(vec![]);
    };
    let links = get_links(
        GetLinksInputBuilder::try_new(original_issue_hash.clone(), LinkTypes::IssueUpdates)?
            .build(),
    )?;
    let get_input: Vec<GetInput> = links
        .into_iter()
        .map(|link| {
            Ok(GetInput::new(
                link.target
                    .into_action_hash()
                    .ok_or(wasm_error!(WasmErrorInner::Guest(
                        "No action hash associated with link".to_string()
                    )))?
                    .into(),
                GetOptions::default(),
            ))
        })
        .collect::<ExternResult<Vec<GetInput>>>()?;
    let records = HDK.with(|hdk| hdk.borrow().get(get_input))?;
    let mut records: Vec<Record> = records.into_iter().flatten().collect();
    records.insert(0, original_record);
    Ok(records)
}

#[derive(Serialize, Deserialize, Debug)]
pub struct UpdateIssueInput {
    pub original_issue_hash: ActionHash,
    pub previous_issue_hash: ActionHash,
    pub updated_issue: Issue,
}

#[hdk_extern]
pub fn update_issue(input: UpdateIssueInput) -> ExternResult<Record> {
    let updated_issue_hash = update_entry(input.previous_issue_hash.clone(), &input.updated_issue)?;
    create_link(
        input.original_issue_hash.clone(),
        updated_issue_hash.clone(),
        LinkTypes::IssueUpdates,
        (),
    )?;
    let record = get(updated_issue_hash.clone(), GetOptions::default())?.ok_or(wasm_error!(
        WasmErrorInner::Guest("Could not find the newly updated Issue".to_string())
    ))?;
    Ok(record)
}
