#![allow(dead_code)]
#![allow(unused_variables)]
#![allow(unused_imports)]

use hdk::prelude::*;
use holochain::{conductor::config::ConductorConfig, sweettest::*};
use std::time::Duration;

use fixie_integrity::*;

use fixie::issue::UpdateIssueInput;

mod common;
use common::{create_issue, sample_issue_1, sample_issue_2};

#[tokio::test(flavor = "multi_thread")]
async fn create_issue_test() {
    // Use prebuilt dna file
    let dna_path = std::env::current_dir().unwrap().join(
        std::env::var("DNA_PATH").expect("DNA_PATH not set, must be run using nix flake check"),
    );
    let dna = SweetDnaFile::from_bundle(&dna_path).await.unwrap();

    // Set up conductors
    let mut conductors = SweetConductorBatch::from_config(2, ConductorConfig::default()).await;
    let apps = conductors.setup_app("fixie_test", &[dna]).await.unwrap();
    conductors.exchange_peer_info().await;

    let ((alice,), (_bobbo,)) = apps.into_tuples();

    let alice_zome = alice.zome("fixie");

    let sample = sample_issue_1(&conductors[0], &alice_zome).await;

    // Alice creates a Issue
    let record: Record = create_issue(&conductors[0], &alice_zome, sample.clone()).await;
    let entry: Issue = record.entry().to_app_option().unwrap().unwrap();
    assert!(entry.eq(&sample));
}

#[tokio::test(flavor = "multi_thread")]
async fn create_and_read_issue() {
    // Use prebuilt dna file
    let dna_path = std::env::current_dir().unwrap().join(
        std::env::var("DNA_PATH").expect("DNA_PATH not set, must be run using nix flake check"),
    );
    let dna = SweetDnaFile::from_bundle(&dna_path).await.unwrap();

    // Set up conductors
    let mut conductors = SweetConductorBatch::from_config(2, ConductorConfig::default()).await;
    let apps = conductors.setup_app("fixie_test", &[dna]).await.unwrap();
    conductors.exchange_peer_info().await;

    let ((alice,), (bobbo,)) = apps.into_tuples();

    let alice_zome = alice.zome("fixie");
    let bob_zome = bobbo.zome("fixie");

    let sample = sample_issue_1(&conductors[0], &alice_zome).await;

    // Alice creates a Issue
    let record: Record = create_issue(&conductors[0], &alice_zome, sample.clone()).await;

    await_consistency(Duration::from_secs(60), [&alice, &bobbo])
        .await
        .expect("Timed out waiting for consistency");

    let get_record: Option<Record> = conductors[1]
        .call(
            &bob_zome,
            "get_original_issue",
            record.signed_action.action_address().clone(),
        )
        .await;

    assert_eq!(record, get_record.unwrap());
}

#[tokio::test(flavor = "multi_thread")]
async fn create_and_update_issue() {
    // Use prebuilt dna file
    let dna_path = std::env::current_dir().unwrap().join(
        std::env::var("DNA_PATH").expect("DNA_PATH not set, must be run using nix flake check"),
    );
    let dna = SweetDnaFile::from_bundle(&dna_path).await.unwrap();

    // Set up conductors
    let mut conductors = SweetConductorBatch::from_config(2, ConductorConfig::default()).await;
    let apps = conductors.setup_app("fixie_test", &[dna]).await.unwrap();
    conductors.exchange_peer_info().await;

    let ((alice,), (bobbo,)) = apps.into_tuples();

    let alice_zome = alice.zome("fixie");
    let bob_zome = bobbo.zome("fixie");

    let sample_1 = sample_issue_1(&conductors[0], &alice_zome).await;

    // Alice creates a Issue
    let record: Record = create_issue(&conductors[0], &alice_zome, sample_1.clone()).await;
    let original_action_hash = record.signed_action.hashed.hash.clone();

    await_consistency(Duration::from_secs(60), [&alice, &bobbo])
        .await
        .expect("Timed out waiting for consistency");

    let sample_2 = sample_issue_2(&conductors[0], &alice_zome).await;
    let input = UpdateIssueInput {
        original_issue_hash: original_action_hash.clone(),
        previous_issue_hash: original_action_hash.clone(),
        updated_issue: sample_2.clone(),
    };

    // Alice updates the Issue
    let update_record: Record = conductors[0].call(&alice_zome, "update_issue", input).await;

    let entry: Issue = update_record.entry().to_app_option().unwrap().unwrap();
    assert_eq!(sample_2, entry);

    await_consistency(Duration::from_secs(60), [&alice, &bobbo])
        .await
        .expect("Timed out waiting for consistency");

    let get_record: Option<Record> = conductors[1]
        .call(&bob_zome, "get_latest_issue", original_action_hash.clone())
        .await;

    assert_eq!(update_record, get_record.unwrap());

    let input = UpdateIssueInput {
        original_issue_hash: original_action_hash.clone(),
        previous_issue_hash: update_record.signed_action.hashed.hash.clone(),
        updated_issue: sample_1.clone(),
    };

    // Alice updates the Issue again
    let update_record: Record = conductors[0].call(&alice_zome, "update_issue", input).await;

    let entry: Issue = update_record.entry().to_app_option().unwrap().unwrap();
    assert_eq!(sample_1, entry);

    await_consistency(Duration::from_secs(60), [&alice, &bobbo])
        .await
        .expect("Timed out waiting for consistency");

    let get_record: Option<Record> = conductors[1]
        .call(&bob_zome, "get_latest_issue", original_action_hash.clone())
        .await;

    assert_eq!(update_record, get_record.unwrap());

    let all_revisions: Vec<Record> = conductors[1]
        .call(
            &bob_zome,
            "get_all_revisions_for_issue",
            original_action_hash.clone(),
        )
        .await;
    assert_eq!(all_revisions.len(), 3);
}
