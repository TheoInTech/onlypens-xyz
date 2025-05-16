import {
  createUseReadContract,
  createUseWriteContract,
  createUseSimulateContract,
  createUseWatchContractEvent,
} from 'wagmi/codegen'

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// OnlyPens
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Base Basescan__](https://basescan.org/address/0x88566d8202EaD5a6D6b96E4a37A1D197f0d94BC4)
 */
export const onlyPensAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: '_usdc', internalType: 'contract IERC20', type: 'address' },
      { name: '_treasury', internalType: 'address', type: 'address' },
      { name: '_platformFeeBps', internalType: 'uint16', type: 'uint16' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'error',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'OwnableInvalidOwner',
  },
  {
    type: 'error',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'OwnableUnauthorizedAccount',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'packageId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'deliverableId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'writer',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'approvedQuantity',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'DeliverableApproved',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'packageId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'deliverableId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'contentType',
        internalType: 'string',
        type: 'string',
        indexed: false,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'quantity',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'DeliverableCreated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'packageId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'deliverableId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'writer',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'submittedQuantity',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'DeliverableRejected',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'packageId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'deliverableId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'writer',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'submittedQuantity',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'DeliverableRevised',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'packageId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'deliverableId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'writer',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'submittedQuantity',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'DeliverableSubmitted',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'packageId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'ghostwriter',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'GhostwriterInvited',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'packageId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
    ],
    name: 'GigPackageCancelled',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'packageId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
    ],
    name: 'GigPackageCompleted',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'packageId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'creator',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'expiresAt',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'GigPackageCreated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'packageId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
    ],
    name: 'GigPackageExpired',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'packageId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'ghostwriter',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'InvitationAccepted',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'packageId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'ghostwriter',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'InvitationDeclined',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'previousOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'OwnershipTransferred',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'packageId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'deliverableId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'platformFee',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'PaymentReleased',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'newFeeBps',
        internalType: 'uint16',
        type: 'uint16',
        indexed: false,
      },
    ],
    name: 'PlatformFeeUpdated',
  },
  {
    type: 'function',
    inputs: [],
    name: 'RELEASE_TIMEOUT',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_packageId', internalType: 'uint256', type: 'uint256' }],
    name: 'acceptInvitation',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_packageId', internalType: 'uint256', type: 'uint256' }],
    name: 'approveAllDeliverables',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_packageId', internalType: 'uint256', type: 'uint256' },
      { name: '_deliverableId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'approveDeliverable',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_packageId', internalType: 'uint256', type: 'uint256' }],
    name: 'cancelExpiredPackage',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_packageId', internalType: 'uint256', type: 'uint256' }],
    name: 'cancelGigPackage',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_totalAmount', internalType: 'uint256', type: 'uint256' },
      {
        name: '_deliverables',
        internalType: 'struct DeliverableInput[]',
        type: 'tuple[]',
        components: [
          { name: 'contentType', internalType: 'string', type: 'string' },
          { name: 'amount', internalType: 'uint256', type: 'uint256' },
          { name: 'quantity', internalType: 'uint256', type: 'uint256' },
        ],
      },
      { name: '_expiresAt', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'createGigPackage',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_packageId', internalType: 'uint256', type: 'uint256' }],
    name: 'declineInvitation',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'uint256', type: 'uint256' },
      { name: '', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'deliverableIndexInPackage',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_packageId', internalType: 'uint256', type: 'uint256' }],
    name: 'getActiveInvitees',
    outputs: [{ name: '', internalType: 'address[]', type: 'address[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_packageId', internalType: 'uint256', type: 'uint256' }],
    name: 'getPackageDeliverables',
    outputs: [{ name: '', internalType: 'uint256[]', type: 'uint256[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_packageId', internalType: 'uint256', type: 'uint256' }],
    name: 'getPackageDetails',
    outputs: [
      { name: 'creator', internalType: 'address', type: 'address' },
      { name: 'writer', internalType: 'address', type: 'address' },
      { name: 'totalAmount', internalType: 'uint256', type: 'uint256' },
      { name: 'createdAt', internalType: 'uint256', type: 'uint256' },
      { name: 'lastUpdated', internalType: 'uint256', type: 'uint256' },
      { name: 'expiresAt', internalType: 'uint256', type: 'uint256' },
      {
        name: 'status',
        internalType: 'enum OnlyPens.PackageStatus',
        type: 'uint8',
      },
      { name: 'numDeliverables', internalType: 'uint256', type: 'uint256' },
      { name: 'numApproved', internalType: 'uint256', type: 'uint256' },
      { name: 'amountReleased', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_user', internalType: 'address', type: 'address' },
      { name: '_offset', internalType: 'uint256', type: 'uint256' },
      { name: '_limit', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'getUserPackageDetails',
    outputs: [
      { name: 'packageIds', internalType: 'uint256[]', type: 'uint256[]' },
      { name: 'total', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_user', internalType: 'address', type: 'address' }],
    name: 'getUserPackages',
    outputs: [{ name: '', internalType: 'uint256[]', type: 'uint256[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_packageId', internalType: 'uint256', type: 'uint256' },
      { name: '_ghostwriter', internalType: 'address', type: 'address' },
    ],
    name: 'inviteGhostwriter',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'uint256', type: 'uint256' },
      { name: '', internalType: 'address', type: 'address' },
    ],
    name: 'isInvited',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_packageId', internalType: 'uint256', type: 'uint256' }],
    name: 'isPackageExpired',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'nextDeliverableId',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'nextPackageId',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'uint256', type: 'uint256' },
      { name: '', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'packageDeliverableIds',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'uint256', type: 'uint256' },
      { name: '', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'packageDeliverables',
    outputs: [
      { name: 'id', internalType: 'uint256', type: 'uint256' },
      { name: 'contentType', internalType: 'string', type: 'string' },
      {
        name: 'status',
        internalType: 'enum OnlyPens.DeliverableStatus',
        type: 'uint8',
      },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
      { name: 'quantity', internalType: 'uint256', type: 'uint256' },
      { name: 'submittedQuantity', internalType: 'uint256', type: 'uint256' },
      { name: 'submittedAt', internalType: 'uint256', type: 'uint256' },
      { name: 'approvedAt', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'packageExists',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'uint256', type: 'uint256' },
      { name: '', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'packageInvitees',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'packages',
    outputs: [
      { name: 'packageId', internalType: 'uint256', type: 'uint256' },
      { name: 'creator', internalType: 'address', type: 'address' },
      { name: 'writer', internalType: 'address', type: 'address' },
      { name: 'totalAmount', internalType: 'uint256', type: 'uint256' },
      { name: 'createdAt', internalType: 'uint256', type: 'uint256' },
      { name: 'lastUpdated', internalType: 'uint256', type: 'uint256' },
      { name: 'expiresAt', internalType: 'uint256', type: 'uint256' },
      {
        name: 'status',
        internalType: 'enum OnlyPens.PackageStatus',
        type: 'uint8',
      },
      { name: 'numDeliverables', internalType: 'uint256', type: 'uint256' },
      { name: 'numApproved', internalType: 'uint256', type: 'uint256' },
      { name: 'amountReleased', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'platformFeeBps',
    outputs: [{ name: '', internalType: 'uint16', type: 'uint16' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_tokenAddress', internalType: 'address', type: 'address' },
      { name: '_amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'recoverERC20',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_packageId', internalType: 'uint256', type: 'uint256' },
      { name: '_deliverableId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'rejectDeliverable',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_newFeeBps', internalType: 'uint16', type: 'uint16' }],
    name: 'setPlatformFee',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_packageId', internalType: 'uint256', type: 'uint256' },
      { name: '_deliverableId', internalType: 'uint256', type: 'uint256' },
      { name: '_submittedQuantity', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'submitDeliverable',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'newOwner', internalType: 'address', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'treasury',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'usdc',
    outputs: [{ name: '', internalType: 'contract IERC20', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'userPackages',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
] as const

/**
 * [__View Contract on Base Basescan__](https://basescan.org/address/0x88566d8202EaD5a6D6b96E4a37A1D197f0d94BC4)
 */
export const onlyPensAddress = {
  8453: '0x88566d8202EaD5a6D6b96E4a37A1D197f0d94BC4',
} as const

/**
 * [__View Contract on Base Basescan__](https://basescan.org/address/0x88566d8202EaD5a6D6b96E4a37A1D197f0d94BC4)
 */
export const onlyPensConfig = {
  address: onlyPensAddress,
  abi: onlyPensAbi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// React
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link onlyPensAbi}__
 *
 * [__View Contract on Base Basescan__](https://basescan.org/address/0x88566d8202EaD5a6D6b96E4a37A1D197f0d94BC4)
 */
export const useReadOnlyPens = /*#__PURE__*/ createUseReadContract({
  abi: onlyPensAbi,
  address: onlyPensAddress,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link onlyPensAbi}__ and `functionName` set to `"RELEASE_TIMEOUT"`
 *
 * [__View Contract on Base Basescan__](https://basescan.org/address/0x88566d8202EaD5a6D6b96E4a37A1D197f0d94BC4)
 */
export const useReadOnlyPensReleaseTimeout =
  /*#__PURE__*/ createUseReadContract({
    abi: onlyPensAbi,
    address: onlyPensAddress,
    functionName: 'RELEASE_TIMEOUT',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link onlyPensAbi}__ and `functionName` set to `"deliverableIndexInPackage"`
 *
 * [__View Contract on Base Basescan__](https://basescan.org/address/0x88566d8202EaD5a6D6b96E4a37A1D197f0d94BC4)
 */
export const useReadOnlyPensDeliverableIndexInPackage =
  /*#__PURE__*/ createUseReadContract({
    abi: onlyPensAbi,
    address: onlyPensAddress,
    functionName: 'deliverableIndexInPackage',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link onlyPensAbi}__ and `functionName` set to `"getActiveInvitees"`
 *
 * [__View Contract on Base Basescan__](https://basescan.org/address/0x88566d8202EaD5a6D6b96E4a37A1D197f0d94BC4)
 */
export const useReadOnlyPensGetActiveInvitees =
  /*#__PURE__*/ createUseReadContract({
    abi: onlyPensAbi,
    address: onlyPensAddress,
    functionName: 'getActiveInvitees',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link onlyPensAbi}__ and `functionName` set to `"getPackageDeliverables"`
 *
 * [__View Contract on Base Basescan__](https://basescan.org/address/0x88566d8202EaD5a6D6b96E4a37A1D197f0d94BC4)
 */
export const useReadOnlyPensGetPackageDeliverables =
  /*#__PURE__*/ createUseReadContract({
    abi: onlyPensAbi,
    address: onlyPensAddress,
    functionName: 'getPackageDeliverables',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link onlyPensAbi}__ and `functionName` set to `"getPackageDetails"`
 *
 * [__View Contract on Base Basescan__](https://basescan.org/address/0x88566d8202EaD5a6D6b96E4a37A1D197f0d94BC4)
 */
export const useReadOnlyPensGetPackageDetails =
  /*#__PURE__*/ createUseReadContract({
    abi: onlyPensAbi,
    address: onlyPensAddress,
    functionName: 'getPackageDetails',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link onlyPensAbi}__ and `functionName` set to `"getUserPackageDetails"`
 *
 * [__View Contract on Base Basescan__](https://basescan.org/address/0x88566d8202EaD5a6D6b96E4a37A1D197f0d94BC4)
 */
export const useReadOnlyPensGetUserPackageDetails =
  /*#__PURE__*/ createUseReadContract({
    abi: onlyPensAbi,
    address: onlyPensAddress,
    functionName: 'getUserPackageDetails',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link onlyPensAbi}__ and `functionName` set to `"getUserPackages"`
 *
 * [__View Contract on Base Basescan__](https://basescan.org/address/0x88566d8202EaD5a6D6b96E4a37A1D197f0d94BC4)
 */
export const useReadOnlyPensGetUserPackages =
  /*#__PURE__*/ createUseReadContract({
    abi: onlyPensAbi,
    address: onlyPensAddress,
    functionName: 'getUserPackages',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link onlyPensAbi}__ and `functionName` set to `"isInvited"`
 *
 * [__View Contract on Base Basescan__](https://basescan.org/address/0x88566d8202EaD5a6D6b96E4a37A1D197f0d94BC4)
 */
export const useReadOnlyPensIsInvited = /*#__PURE__*/ createUseReadContract({
  abi: onlyPensAbi,
  address: onlyPensAddress,
  functionName: 'isInvited',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link onlyPensAbi}__ and `functionName` set to `"isPackageExpired"`
 *
 * [__View Contract on Base Basescan__](https://basescan.org/address/0x88566d8202EaD5a6D6b96E4a37A1D197f0d94BC4)
 */
export const useReadOnlyPensIsPackageExpired =
  /*#__PURE__*/ createUseReadContract({
    abi: onlyPensAbi,
    address: onlyPensAddress,
    functionName: 'isPackageExpired',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link onlyPensAbi}__ and `functionName` set to `"nextDeliverableId"`
 *
 * [__View Contract on Base Basescan__](https://basescan.org/address/0x88566d8202EaD5a6D6b96E4a37A1D197f0d94BC4)
 */
export const useReadOnlyPensNextDeliverableId =
  /*#__PURE__*/ createUseReadContract({
    abi: onlyPensAbi,
    address: onlyPensAddress,
    functionName: 'nextDeliverableId',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link onlyPensAbi}__ and `functionName` set to `"nextPackageId"`
 *
 * [__View Contract on Base Basescan__](https://basescan.org/address/0x88566d8202EaD5a6D6b96E4a37A1D197f0d94BC4)
 */
export const useReadOnlyPensNextPackageId = /*#__PURE__*/ createUseReadContract(
  { abi: onlyPensAbi, address: onlyPensAddress, functionName: 'nextPackageId' },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link onlyPensAbi}__ and `functionName` set to `"owner"`
 *
 * [__View Contract on Base Basescan__](https://basescan.org/address/0x88566d8202EaD5a6D6b96E4a37A1D197f0d94BC4)
 */
export const useReadOnlyPensOwner = /*#__PURE__*/ createUseReadContract({
  abi: onlyPensAbi,
  address: onlyPensAddress,
  functionName: 'owner',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link onlyPensAbi}__ and `functionName` set to `"packageDeliverableIds"`
 *
 * [__View Contract on Base Basescan__](https://basescan.org/address/0x88566d8202EaD5a6D6b96E4a37A1D197f0d94BC4)
 */
export const useReadOnlyPensPackageDeliverableIds =
  /*#__PURE__*/ createUseReadContract({
    abi: onlyPensAbi,
    address: onlyPensAddress,
    functionName: 'packageDeliverableIds',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link onlyPensAbi}__ and `functionName` set to `"packageDeliverables"`
 *
 * [__View Contract on Base Basescan__](https://basescan.org/address/0x88566d8202EaD5a6D6b96E4a37A1D197f0d94BC4)
 */
export const useReadOnlyPensPackageDeliverables =
  /*#__PURE__*/ createUseReadContract({
    abi: onlyPensAbi,
    address: onlyPensAddress,
    functionName: 'packageDeliverables',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link onlyPensAbi}__ and `functionName` set to `"packageExists"`
 *
 * [__View Contract on Base Basescan__](https://basescan.org/address/0x88566d8202EaD5a6D6b96E4a37A1D197f0d94BC4)
 */
export const useReadOnlyPensPackageExists = /*#__PURE__*/ createUseReadContract(
  { abi: onlyPensAbi, address: onlyPensAddress, functionName: 'packageExists' },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link onlyPensAbi}__ and `functionName` set to `"packageInvitees"`
 *
 * [__View Contract on Base Basescan__](https://basescan.org/address/0x88566d8202EaD5a6D6b96E4a37A1D197f0d94BC4)
 */
export const useReadOnlyPensPackageInvitees =
  /*#__PURE__*/ createUseReadContract({
    abi: onlyPensAbi,
    address: onlyPensAddress,
    functionName: 'packageInvitees',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link onlyPensAbi}__ and `functionName` set to `"packages"`
 *
 * [__View Contract on Base Basescan__](https://basescan.org/address/0x88566d8202EaD5a6D6b96E4a37A1D197f0d94BC4)
 */
export const useReadOnlyPensPackages = /*#__PURE__*/ createUseReadContract({
  abi: onlyPensAbi,
  address: onlyPensAddress,
  functionName: 'packages',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link onlyPensAbi}__ and `functionName` set to `"platformFeeBps"`
 *
 * [__View Contract on Base Basescan__](https://basescan.org/address/0x88566d8202EaD5a6D6b96E4a37A1D197f0d94BC4)
 */
export const useReadOnlyPensPlatformFeeBps =
  /*#__PURE__*/ createUseReadContract({
    abi: onlyPensAbi,
    address: onlyPensAddress,
    functionName: 'platformFeeBps',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link onlyPensAbi}__ and `functionName` set to `"treasury"`
 *
 * [__View Contract on Base Basescan__](https://basescan.org/address/0x88566d8202EaD5a6D6b96E4a37A1D197f0d94BC4)
 */
export const useReadOnlyPensTreasury = /*#__PURE__*/ createUseReadContract({
  abi: onlyPensAbi,
  address: onlyPensAddress,
  functionName: 'treasury',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link onlyPensAbi}__ and `functionName` set to `"usdc"`
 *
 * [__View Contract on Base Basescan__](https://basescan.org/address/0x88566d8202EaD5a6D6b96E4a37A1D197f0d94BC4)
 */
export const useReadOnlyPensUsdc = /*#__PURE__*/ createUseReadContract({
  abi: onlyPensAbi,
  address: onlyPensAddress,
  functionName: 'usdc',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link onlyPensAbi}__ and `functionName` set to `"userPackages"`
 *
 * [__View Contract on Base Basescan__](https://basescan.org/address/0x88566d8202EaD5a6D6b96E4a37A1D197f0d94BC4)
 */
export const useReadOnlyPensUserPackages = /*#__PURE__*/ createUseReadContract({
  abi: onlyPensAbi,
  address: onlyPensAddress,
  functionName: 'userPackages',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link onlyPensAbi}__
 *
 * [__View Contract on Base Basescan__](https://basescan.org/address/0x88566d8202EaD5a6D6b96E4a37A1D197f0d94BC4)
 */
export const useWriteOnlyPens = /*#__PURE__*/ createUseWriteContract({
  abi: onlyPensAbi,
  address: onlyPensAddress,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link onlyPensAbi}__ and `functionName` set to `"acceptInvitation"`
 *
 * [__View Contract on Base Basescan__](https://basescan.org/address/0x88566d8202EaD5a6D6b96E4a37A1D197f0d94BC4)
 */
export const useWriteOnlyPensAcceptInvitation =
  /*#__PURE__*/ createUseWriteContract({
    abi: onlyPensAbi,
    address: onlyPensAddress,
    functionName: 'acceptInvitation',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link onlyPensAbi}__ and `functionName` set to `"approveAllDeliverables"`
 *
 * [__View Contract on Base Basescan__](https://basescan.org/address/0x88566d8202EaD5a6D6b96E4a37A1D197f0d94BC4)
 */
export const useWriteOnlyPensApproveAllDeliverables =
  /*#__PURE__*/ createUseWriteContract({
    abi: onlyPensAbi,
    address: onlyPensAddress,
    functionName: 'approveAllDeliverables',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link onlyPensAbi}__ and `functionName` set to `"approveDeliverable"`
 *
 * [__View Contract on Base Basescan__](https://basescan.org/address/0x88566d8202EaD5a6D6b96E4a37A1D197f0d94BC4)
 */
export const useWriteOnlyPensApproveDeliverable =
  /*#__PURE__*/ createUseWriteContract({
    abi: onlyPensAbi,
    address: onlyPensAddress,
    functionName: 'approveDeliverable',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link onlyPensAbi}__ and `functionName` set to `"cancelExpiredPackage"`
 *
 * [__View Contract on Base Basescan__](https://basescan.org/address/0x88566d8202EaD5a6D6b96E4a37A1D197f0d94BC4)
 */
export const useWriteOnlyPensCancelExpiredPackage =
  /*#__PURE__*/ createUseWriteContract({
    abi: onlyPensAbi,
    address: onlyPensAddress,
    functionName: 'cancelExpiredPackage',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link onlyPensAbi}__ and `functionName` set to `"cancelGigPackage"`
 *
 * [__View Contract on Base Basescan__](https://basescan.org/address/0x88566d8202EaD5a6D6b96E4a37A1D197f0d94BC4)
 */
export const useWriteOnlyPensCancelGigPackage =
  /*#__PURE__*/ createUseWriteContract({
    abi: onlyPensAbi,
    address: onlyPensAddress,
    functionName: 'cancelGigPackage',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link onlyPensAbi}__ and `functionName` set to `"createGigPackage"`
 *
 * [__View Contract on Base Basescan__](https://basescan.org/address/0x88566d8202EaD5a6D6b96E4a37A1D197f0d94BC4)
 */
export const useWriteOnlyPensCreateGigPackage =
  /*#__PURE__*/ createUseWriteContract({
    abi: onlyPensAbi,
    address: onlyPensAddress,
    functionName: 'createGigPackage',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link onlyPensAbi}__ and `functionName` set to `"declineInvitation"`
 *
 * [__View Contract on Base Basescan__](https://basescan.org/address/0x88566d8202EaD5a6D6b96E4a37A1D197f0d94BC4)
 */
export const useWriteOnlyPensDeclineInvitation =
  /*#__PURE__*/ createUseWriteContract({
    abi: onlyPensAbi,
    address: onlyPensAddress,
    functionName: 'declineInvitation',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link onlyPensAbi}__ and `functionName` set to `"inviteGhostwriter"`
 *
 * [__View Contract on Base Basescan__](https://basescan.org/address/0x88566d8202EaD5a6D6b96E4a37A1D197f0d94BC4)
 */
export const useWriteOnlyPensInviteGhostwriter =
  /*#__PURE__*/ createUseWriteContract({
    abi: onlyPensAbi,
    address: onlyPensAddress,
    functionName: 'inviteGhostwriter',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link onlyPensAbi}__ and `functionName` set to `"recoverERC20"`
 *
 * [__View Contract on Base Basescan__](https://basescan.org/address/0x88566d8202EaD5a6D6b96E4a37A1D197f0d94BC4)
 */
export const useWriteOnlyPensRecoverErc20 =
  /*#__PURE__*/ createUseWriteContract({
    abi: onlyPensAbi,
    address: onlyPensAddress,
    functionName: 'recoverERC20',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link onlyPensAbi}__ and `functionName` set to `"rejectDeliverable"`
 *
 * [__View Contract on Base Basescan__](https://basescan.org/address/0x88566d8202EaD5a6D6b96E4a37A1D197f0d94BC4)
 */
export const useWriteOnlyPensRejectDeliverable =
  /*#__PURE__*/ createUseWriteContract({
    abi: onlyPensAbi,
    address: onlyPensAddress,
    functionName: 'rejectDeliverable',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link onlyPensAbi}__ and `functionName` set to `"renounceOwnership"`
 *
 * [__View Contract on Base Basescan__](https://basescan.org/address/0x88566d8202EaD5a6D6b96E4a37A1D197f0d94BC4)
 */
export const useWriteOnlyPensRenounceOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: onlyPensAbi,
    address: onlyPensAddress,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link onlyPensAbi}__ and `functionName` set to `"setPlatformFee"`
 *
 * [__View Contract on Base Basescan__](https://basescan.org/address/0x88566d8202EaD5a6D6b96E4a37A1D197f0d94BC4)
 */
export const useWriteOnlyPensSetPlatformFee =
  /*#__PURE__*/ createUseWriteContract({
    abi: onlyPensAbi,
    address: onlyPensAddress,
    functionName: 'setPlatformFee',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link onlyPensAbi}__ and `functionName` set to `"submitDeliverable"`
 *
 * [__View Contract on Base Basescan__](https://basescan.org/address/0x88566d8202EaD5a6D6b96E4a37A1D197f0d94BC4)
 */
export const useWriteOnlyPensSubmitDeliverable =
  /*#__PURE__*/ createUseWriteContract({
    abi: onlyPensAbi,
    address: onlyPensAddress,
    functionName: 'submitDeliverable',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link onlyPensAbi}__ and `functionName` set to `"transferOwnership"`
 *
 * [__View Contract on Base Basescan__](https://basescan.org/address/0x88566d8202EaD5a6D6b96E4a37A1D197f0d94BC4)
 */
export const useWriteOnlyPensTransferOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: onlyPensAbi,
    address: onlyPensAddress,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link onlyPensAbi}__
 *
 * [__View Contract on Base Basescan__](https://basescan.org/address/0x88566d8202EaD5a6D6b96E4a37A1D197f0d94BC4)
 */
export const useSimulateOnlyPens = /*#__PURE__*/ createUseSimulateContract({
  abi: onlyPensAbi,
  address: onlyPensAddress,
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link onlyPensAbi}__ and `functionName` set to `"acceptInvitation"`
 *
 * [__View Contract on Base Basescan__](https://basescan.org/address/0x88566d8202EaD5a6D6b96E4a37A1D197f0d94BC4)
 */
export const useSimulateOnlyPensAcceptInvitation =
  /*#__PURE__*/ createUseSimulateContract({
    abi: onlyPensAbi,
    address: onlyPensAddress,
    functionName: 'acceptInvitation',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link onlyPensAbi}__ and `functionName` set to `"approveAllDeliverables"`
 *
 * [__View Contract on Base Basescan__](https://basescan.org/address/0x88566d8202EaD5a6D6b96E4a37A1D197f0d94BC4)
 */
export const useSimulateOnlyPensApproveAllDeliverables =
  /*#__PURE__*/ createUseSimulateContract({
    abi: onlyPensAbi,
    address: onlyPensAddress,
    functionName: 'approveAllDeliverables',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link onlyPensAbi}__ and `functionName` set to `"approveDeliverable"`
 *
 * [__View Contract on Base Basescan__](https://basescan.org/address/0x88566d8202EaD5a6D6b96E4a37A1D197f0d94BC4)
 */
export const useSimulateOnlyPensApproveDeliverable =
  /*#__PURE__*/ createUseSimulateContract({
    abi: onlyPensAbi,
    address: onlyPensAddress,
    functionName: 'approveDeliverable',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link onlyPensAbi}__ and `functionName` set to `"cancelExpiredPackage"`
 *
 * [__View Contract on Base Basescan__](https://basescan.org/address/0x88566d8202EaD5a6D6b96E4a37A1D197f0d94BC4)
 */
export const useSimulateOnlyPensCancelExpiredPackage =
  /*#__PURE__*/ createUseSimulateContract({
    abi: onlyPensAbi,
    address: onlyPensAddress,
    functionName: 'cancelExpiredPackage',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link onlyPensAbi}__ and `functionName` set to `"cancelGigPackage"`
 *
 * [__View Contract on Base Basescan__](https://basescan.org/address/0x88566d8202EaD5a6D6b96E4a37A1D197f0d94BC4)
 */
export const useSimulateOnlyPensCancelGigPackage =
  /*#__PURE__*/ createUseSimulateContract({
    abi: onlyPensAbi,
    address: onlyPensAddress,
    functionName: 'cancelGigPackage',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link onlyPensAbi}__ and `functionName` set to `"createGigPackage"`
 *
 * [__View Contract on Base Basescan__](https://basescan.org/address/0x88566d8202EaD5a6D6b96E4a37A1D197f0d94BC4)
 */
export const useSimulateOnlyPensCreateGigPackage =
  /*#__PURE__*/ createUseSimulateContract({
    abi: onlyPensAbi,
    address: onlyPensAddress,
    functionName: 'createGigPackage',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link onlyPensAbi}__ and `functionName` set to `"declineInvitation"`
 *
 * [__View Contract on Base Basescan__](https://basescan.org/address/0x88566d8202EaD5a6D6b96E4a37A1D197f0d94BC4)
 */
export const useSimulateOnlyPensDeclineInvitation =
  /*#__PURE__*/ createUseSimulateContract({
    abi: onlyPensAbi,
    address: onlyPensAddress,
    functionName: 'declineInvitation',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link onlyPensAbi}__ and `functionName` set to `"inviteGhostwriter"`
 *
 * [__View Contract on Base Basescan__](https://basescan.org/address/0x88566d8202EaD5a6D6b96E4a37A1D197f0d94BC4)
 */
export const useSimulateOnlyPensInviteGhostwriter =
  /*#__PURE__*/ createUseSimulateContract({
    abi: onlyPensAbi,
    address: onlyPensAddress,
    functionName: 'inviteGhostwriter',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link onlyPensAbi}__ and `functionName` set to `"recoverERC20"`
 *
 * [__View Contract on Base Basescan__](https://basescan.org/address/0x88566d8202EaD5a6D6b96E4a37A1D197f0d94BC4)
 */
export const useSimulateOnlyPensRecoverErc20 =
  /*#__PURE__*/ createUseSimulateContract({
    abi: onlyPensAbi,
    address: onlyPensAddress,
    functionName: 'recoverERC20',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link onlyPensAbi}__ and `functionName` set to `"rejectDeliverable"`
 *
 * [__View Contract on Base Basescan__](https://basescan.org/address/0x88566d8202EaD5a6D6b96E4a37A1D197f0d94BC4)
 */
export const useSimulateOnlyPensRejectDeliverable =
  /*#__PURE__*/ createUseSimulateContract({
    abi: onlyPensAbi,
    address: onlyPensAddress,
    functionName: 'rejectDeliverable',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link onlyPensAbi}__ and `functionName` set to `"renounceOwnership"`
 *
 * [__View Contract on Base Basescan__](https://basescan.org/address/0x88566d8202EaD5a6D6b96E4a37A1D197f0d94BC4)
 */
export const useSimulateOnlyPensRenounceOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: onlyPensAbi,
    address: onlyPensAddress,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link onlyPensAbi}__ and `functionName` set to `"setPlatformFee"`
 *
 * [__View Contract on Base Basescan__](https://basescan.org/address/0x88566d8202EaD5a6D6b96E4a37A1D197f0d94BC4)
 */
export const useSimulateOnlyPensSetPlatformFee =
  /*#__PURE__*/ createUseSimulateContract({
    abi: onlyPensAbi,
    address: onlyPensAddress,
    functionName: 'setPlatformFee',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link onlyPensAbi}__ and `functionName` set to `"submitDeliverable"`
 *
 * [__View Contract on Base Basescan__](https://basescan.org/address/0x88566d8202EaD5a6D6b96E4a37A1D197f0d94BC4)
 */
export const useSimulateOnlyPensSubmitDeliverable =
  /*#__PURE__*/ createUseSimulateContract({
    abi: onlyPensAbi,
    address: onlyPensAddress,
    functionName: 'submitDeliverable',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link onlyPensAbi}__ and `functionName` set to `"transferOwnership"`
 *
 * [__View Contract on Base Basescan__](https://basescan.org/address/0x88566d8202EaD5a6D6b96E4a37A1D197f0d94BC4)
 */
export const useSimulateOnlyPensTransferOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: onlyPensAbi,
    address: onlyPensAddress,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link onlyPensAbi}__
 *
 * [__View Contract on Base Basescan__](https://basescan.org/address/0x88566d8202EaD5a6D6b96E4a37A1D197f0d94BC4)
 */
export const useWatchOnlyPensEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: onlyPensAbi,
  address: onlyPensAddress,
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link onlyPensAbi}__ and `eventName` set to `"DeliverableApproved"`
 *
 * [__View Contract on Base Basescan__](https://basescan.org/address/0x88566d8202EaD5a6D6b96E4a37A1D197f0d94BC4)
 */
export const useWatchOnlyPensDeliverableApprovedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: onlyPensAbi,
    address: onlyPensAddress,
    eventName: 'DeliverableApproved',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link onlyPensAbi}__ and `eventName` set to `"DeliverableCreated"`
 *
 * [__View Contract on Base Basescan__](https://basescan.org/address/0x88566d8202EaD5a6D6b96E4a37A1D197f0d94BC4)
 */
export const useWatchOnlyPensDeliverableCreatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: onlyPensAbi,
    address: onlyPensAddress,
    eventName: 'DeliverableCreated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link onlyPensAbi}__ and `eventName` set to `"DeliverableRejected"`
 *
 * [__View Contract on Base Basescan__](https://basescan.org/address/0x88566d8202EaD5a6D6b96E4a37A1D197f0d94BC4)
 */
export const useWatchOnlyPensDeliverableRejectedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: onlyPensAbi,
    address: onlyPensAddress,
    eventName: 'DeliverableRejected',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link onlyPensAbi}__ and `eventName` set to `"DeliverableRevised"`
 *
 * [__View Contract on Base Basescan__](https://basescan.org/address/0x88566d8202EaD5a6D6b96E4a37A1D197f0d94BC4)
 */
export const useWatchOnlyPensDeliverableRevisedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: onlyPensAbi,
    address: onlyPensAddress,
    eventName: 'DeliverableRevised',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link onlyPensAbi}__ and `eventName` set to `"DeliverableSubmitted"`
 *
 * [__View Contract on Base Basescan__](https://basescan.org/address/0x88566d8202EaD5a6D6b96E4a37A1D197f0d94BC4)
 */
export const useWatchOnlyPensDeliverableSubmittedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: onlyPensAbi,
    address: onlyPensAddress,
    eventName: 'DeliverableSubmitted',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link onlyPensAbi}__ and `eventName` set to `"GhostwriterInvited"`
 *
 * [__View Contract on Base Basescan__](https://basescan.org/address/0x88566d8202EaD5a6D6b96E4a37A1D197f0d94BC4)
 */
export const useWatchOnlyPensGhostwriterInvitedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: onlyPensAbi,
    address: onlyPensAddress,
    eventName: 'GhostwriterInvited',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link onlyPensAbi}__ and `eventName` set to `"GigPackageCancelled"`
 *
 * [__View Contract on Base Basescan__](https://basescan.org/address/0x88566d8202EaD5a6D6b96E4a37A1D197f0d94BC4)
 */
export const useWatchOnlyPensGigPackageCancelledEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: onlyPensAbi,
    address: onlyPensAddress,
    eventName: 'GigPackageCancelled',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link onlyPensAbi}__ and `eventName` set to `"GigPackageCompleted"`
 *
 * [__View Contract on Base Basescan__](https://basescan.org/address/0x88566d8202EaD5a6D6b96E4a37A1D197f0d94BC4)
 */
export const useWatchOnlyPensGigPackageCompletedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: onlyPensAbi,
    address: onlyPensAddress,
    eventName: 'GigPackageCompleted',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link onlyPensAbi}__ and `eventName` set to `"GigPackageCreated"`
 *
 * [__View Contract on Base Basescan__](https://basescan.org/address/0x88566d8202EaD5a6D6b96E4a37A1D197f0d94BC4)
 */
export const useWatchOnlyPensGigPackageCreatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: onlyPensAbi,
    address: onlyPensAddress,
    eventName: 'GigPackageCreated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link onlyPensAbi}__ and `eventName` set to `"GigPackageExpired"`
 *
 * [__View Contract on Base Basescan__](https://basescan.org/address/0x88566d8202EaD5a6D6b96E4a37A1D197f0d94BC4)
 */
export const useWatchOnlyPensGigPackageExpiredEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: onlyPensAbi,
    address: onlyPensAddress,
    eventName: 'GigPackageExpired',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link onlyPensAbi}__ and `eventName` set to `"InvitationAccepted"`
 *
 * [__View Contract on Base Basescan__](https://basescan.org/address/0x88566d8202EaD5a6D6b96E4a37A1D197f0d94BC4)
 */
export const useWatchOnlyPensInvitationAcceptedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: onlyPensAbi,
    address: onlyPensAddress,
    eventName: 'InvitationAccepted',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link onlyPensAbi}__ and `eventName` set to `"InvitationDeclined"`
 *
 * [__View Contract on Base Basescan__](https://basescan.org/address/0x88566d8202EaD5a6D6b96E4a37A1D197f0d94BC4)
 */
export const useWatchOnlyPensInvitationDeclinedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: onlyPensAbi,
    address: onlyPensAddress,
    eventName: 'InvitationDeclined',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link onlyPensAbi}__ and `eventName` set to `"OwnershipTransferred"`
 *
 * [__View Contract on Base Basescan__](https://basescan.org/address/0x88566d8202EaD5a6D6b96E4a37A1D197f0d94BC4)
 */
export const useWatchOnlyPensOwnershipTransferredEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: onlyPensAbi,
    address: onlyPensAddress,
    eventName: 'OwnershipTransferred',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link onlyPensAbi}__ and `eventName` set to `"PaymentReleased"`
 *
 * [__View Contract on Base Basescan__](https://basescan.org/address/0x88566d8202EaD5a6D6b96E4a37A1D197f0d94BC4)
 */
export const useWatchOnlyPensPaymentReleasedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: onlyPensAbi,
    address: onlyPensAddress,
    eventName: 'PaymentReleased',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link onlyPensAbi}__ and `eventName` set to `"PlatformFeeUpdated"`
 *
 * [__View Contract on Base Basescan__](https://basescan.org/address/0x88566d8202EaD5a6D6b96E4a37A1D197f0d94BC4)
 */
export const useWatchOnlyPensPlatformFeeUpdatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: onlyPensAbi,
    address: onlyPensAddress,
    eventName: 'PlatformFeeUpdated',
  })
