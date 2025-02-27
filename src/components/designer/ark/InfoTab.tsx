import { Alert } from 'antd';
import { CopyIcon, StatusBadge } from 'components/common';
import DetailsList, { DetailValues } from 'components/common/DetailsList';
import { usePrefixedTranslation } from 'hooks';
import React from 'react';
import { ArkNode, Status } from 'shared/types';
import { useStoreState } from 'store';
import { dockerConfigs } from 'utils/constants';
import { ellipseInner } from 'utils/strings';

interface Props {
  node: ArkNode;
}

const InfoTab: React.FC<Props> = ({ node }) => {
  const { l } = usePrefixedTranslation('cmps.designer.ark.InfoTab');
  const { nodes } = useStoreState(s => s.ark);
  const details: DetailValues = [
    { label: l('nodeType'), value: node.type },
    { label: l('implementation'), value: dockerConfigs[node.implementation].name },
    {
      label: l('version'),
      value: node.docker.image
        ? 'custom'
        : node.version.startsWith('v')
        ? node.version
        : `v${node.version}`,
    },
    {
      label: l('status'),
      value: (
        <StatusBadge
          status={node.status}
          text={l(`enums.status.${Status[node.status]}`)}
        />
      ),
    },
  ];

  if (node.docker.image) {
    details.splice(3, 0, { label: l('customImage'), value: node.docker.image });
  }

  const nodeState = nodes[node.name];
  if (node.status === Status.Started && nodeState) {
    // TODO: Use translatable labels
    details.push(
      {
        label: 'Wallet initialized',
        value: nodeState?.walletStatus?.initialized ? 'Yes' : 'No',
      },
      {
        label: 'Wallet synced',
        value: nodeState?.walletStatus?.synced ? 'Yes' : 'No',
      },
      {
        label: 'Wallet unlocked',
        value: nodeState?.walletStatus?.unlocked ? 'Yes' : 'No',
      },
      {
        label: 'Wallet available balance',
        value: `${nodeState.walletBalance?.mainAccount?.available || 0} BTC`,
      },
      {
        label: 'Wallet locked balance',
        value: `${nodeState.walletBalance?.mainAccount?.locked || 0} BTC`,
      },
      {
        label: 'Connector wallet available balance',
        value: `${nodeState.walletBalance?.connectorsAccount?.available || 0} BTC`,
      },
      {
        label: 'Connector wallet locked balance',
        value: `${nodeState.walletBalance?.connectorsAccount?.locked || 0} BTC`,
      },
    );
  }
  if (node.status === Status.Started && nodeState && nodeState.info) {
    const { info, boardingAddress } = nodeState;
    details.push(
      {
        label: 'Boarding Address',
        value: boardingAddress ? (
          <CopyIcon
            label={l('boardingAddress')}
            value={boardingAddress}
            text={ellipseInner(boardingAddress)}
          />
        ) : (
          ''
        ),
      },
      {
        label: 'forfeitAddress',
        value: (
          <CopyIcon
            label={l('forfeitAddress')}
            value={info.forfeitAddress}
            text={ellipseInner(info.forfeitAddress)}
          />
        ),
      },
      {
        label: 'pubkey',
        value: (
          <CopyIcon
            label={l('pubkey')}
            value={info.pubkey}
            text={ellipseInner(info.pubkey)}
          />
        ),
      },
    );
  }

  return (
    <>
      {node.status === Status.Error && node.errorMsg && (
        <Alert
          type="error"
          message={l('startError', { implementation: node.implementation })}
          description={node.errorMsg}
          closable={false}
          showIcon
        />
      )}
      <DetailsList details={details} />
    </>
  );
};

export default InfoTab;
