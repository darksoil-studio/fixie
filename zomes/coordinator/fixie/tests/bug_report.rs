#![allow(dead_code)]
#![allow(unused_variables)]
#![allow(unused_imports)]

use hdk::prelude::*;
use holochain::{conductor::config::ConductorConfig, sweettest::*};
use std::time::Duration;

use fixie_integrity::*;

mod common;
use common::{create_bug_report, sample_bug_report_1, sample_bug_report_2};

#[tokio::test(flavor = "multi_thread")]
async fn create_bug_report_test() {
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

    let sample = sample_bug_report_1(&conductors[0], &alice_zome).await;

    // Alice creates a BugReport
    let record: Record = create_bug_report(&conductors[0], &alice_zome, sample.clone()).await;
    let entry: BugReport = record.entry().to_app_option().unwrap().unwrap();
    assert!(entry.eq(&sample));
}

#[tokio::test(flavor = "multi_thread")]
async fn create_and_read_bug_report() {
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

    let sample = sample_bug_report_1(&conductors[0], &alice_zome).await;

    // Alice creates a BugReport
    let record: Record = create_bug_report(&conductors[0], &alice_zome, sample.clone()).await;

    await_consistency(Duration::from_secs(60), [&alice, &bobbo])
        .await
        .expect("Timed out waiting for consistency");

    let get_record: Option<Record> = conductors[1]
        .call(
            &bob_zome,
            "get_bug_report",
            record.signed_action.action_address().clone(),
        )
        .await;

    assert_eq!(record, get_record.unwrap());
}
