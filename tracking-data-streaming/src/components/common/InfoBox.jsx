// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import styles from "./InfoBox.module.css";
import Container from "@cloudscape-design/components/container";

// Information box
const InfoBox = ({ header, children }) => {
  return (
    <div className={styles.wrapper}>
      <Container>
        <h2 className={styles.header}>{header}</h2>
        <div className={styles.content}>{children}</div>
      </Container>
    </div>
  );
};

export default InfoBox;
